console.log('Background.js fired');

chrome.runtime.onInstalled.addListener(function (details) {
  // turn on plugin when installed  
  if (details.reason == "install") {
    // alert('installed') - need to use alert and remove and reload the unpacked extension when testing this
    chrome.storage.sync.set({ 'isActive': true });
    chrome.browserAction.setIcon({
      path: "img/spip-on.png"
    });
    // turnOn();
    // chrome.browserAction.setIcon({
    //   path: {
    //     "16": "img/16-icon.png",
    //     "32": "img/32-icon.png",
    //     "48": "img/48-icon.png",
    //     "128": "img/128-icon.png"
    //   }
    // });
  }
  // if the extension is updated, check local storage to see if it's already active
  if (details.reason == "update") {
    chrome.storage.sync.get('isActive', function (val) {
      if (val.isActive) {
        chrome.browserAction.setIcon({
          path: "img/spip-on.png"
        });
        // turnOn();
        // chrome.browserAction.setIcon({
        //   path: {
        //     "16": "img/16-icon.png",
        //     "32": "img/32-icon.png",
        //     "48": "img/48-icon.png",
        //     "128": "img/128-icon.png"
        //   }
        // });
      } else {
        chrome.browserAction.setIcon({
          path: "img/spip-off.png"
        });
        // turnOff();
        // chrome.browserAction.setIcon({
        //   path: {
        //     "16": "img/16-icon-off.png",
        //     "32": "img/32-icon-off.png",
        //     "48": "img/48-icon-off.png",
        //     "128": "img/128-icon-off.png"
        //   }
        // });
      }
    });
  }
});

// when user goes to new tab, we need to check the url and see if it's on the list, and change the icon based on that. maybe the grayscale as well? that way if you set one reddit tab, then go to another one it'll automatically switch without having to refresh
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log('tab changed activeinfo', activeInfo)
  chrome.storage.sync.get(['gsSites', 'gsAll'], function (val) {
    console.log('val.gsSites', val.gsSites);
    console.log('val.gsAll', val.gsAll);
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      console.log(tab);
      var url = tab.url;
      var hostname = extractRootDomain(url);
      console.log('activated url', hostname)
      if (val.gsAll) {
        chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
      } else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
        console.log('site active')
        chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
        chrome.browserAction.setIcon({
          path: "img/spip-on.png"
        });
      } else {
        console.log('site not active')
        chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
        chrome.browserAction.setIcon({
          path: "img/spip-off.png"
        });
      }
    });
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // console.log('tab', tab)
  var url = tab.url;
  // console.log('url', url);
  var hostname = extractRootDomain(url);
  // console.log('hostname', hostname)
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['gsSites', 'gsAll'], function (val) {
      console.log('val.gsSites', val.gsSites);
      console.log('val.gsAll', val.gsAll);
      if (val.gsAll) {
        chrome.tabs.sendMessage(tabId, { type: 'turnOnGray' });
      } else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {       
        chrome.tabs.sendMessage(tabId, { type: 'turnOnGray' });
      } else {
        chrome.tabs.sendMessage(tabId, { type: 'turnOffGray' });        
      }
    });
  }
});
