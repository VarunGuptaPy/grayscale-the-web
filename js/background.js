console.log('Background.js fired');

chrome.runtime.onInstalled.addListener(function (details) {
  // turn on plugin when installed  
  if (details.reason == "install") {
    // alert('installed') - need to use alert and remove and reload the unpacked extension when testing this
    chrome.storage.sync.set({ 'isActive': true });
    turnIconOn();
  }
  // if the extension is updated, check local storage to see if it's already active
  if (details.reason == "update") {
    chrome.storage.sync.get('isActive', function (val) {
      if (val.isActive) {
        turnIconOn();
      } else {
        turnIconOff();
      }
    });
  }
});

// when user goes to new tab, we need to check the url and see if it's on the list, and change the icon based on that. maybe the grayscale as well? that way if you set one reddit tab, then go to another one it'll automatically switch without having to refresh
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log('chrome.runtime', chrome.runtime.getURL('options.html'))
  // var url = tab.url;
  
  console.log('tab changed activeinfo', activeInfo)
  chrome.storage.sync.get(['gsSites', 'gsAll'], function (val) {
    console.log('val.gsSites', val.gsSites);
    console.log('val.gsAll', val.gsAll);
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      console.log(tab);
      var url = tab.url;
      var hostname = extractRootDomain(url);
      console.log('activated url', hostname)
      if (url === chrome.runtime.getURL('options.html')) {
        console.log('on the options page');
        chrome.runtime.sendMessage({ type: 'refreshOptions' });
      } else if (val.gsAll) {
        chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
        turnIconOn();
      } else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
        console.log('site active')
        chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
        turnIconOn();
      } else {
        console.log('site not active')
        chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
        turnIconOff();
      }
    });
  });
});