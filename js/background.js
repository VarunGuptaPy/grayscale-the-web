console.log('Background.js fired');

// Clear out gsTabs when chrome is closed
chrome.storage.sync.set({ 'gsTabs': [] });

function grayToggle(info) {
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {
    console.log('val.gsSites', val.gsSites);
    console.log('val.gsAll', val.gsAll);
    console.log('val.gsTabs', val.gsTabs);
    var tabId = info.tabId < 0 ? 0 : info.tabId;
    if (info.tabId > 0) {
      chrome.tabs.get(info.tabId, function (tab) {
        console.log('tab.id is', tab.id);
        console.log('val.gsTabs.indexOf(tab.id)', val.gsTabs.indexOf(tab.id))
        var url = tab.url;
        var hostname = extractRootDomain(url);
        console.log('activated url', hostname)
        // check if options page
        if (url === chrome.runtime.getURL('options.html')) {
          console.log('on the options page');
          chrome.runtime.sendMessage({ type: 'refreshOptions' });
        }
        // check if this site is on
        else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
          console.log('site active')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
          turnIconOn();
        }
        // check if this tab is on
        else if (val.gsTabs && val.gsTabs.indexOf(tab.id) > -1) {
          console.log('tab active')
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            console.log('tab is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            console.log('tab is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
        }
        // check if all pages toggle on
        else if (val.gsAll) {
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            console.log('all is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            console.log('all is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
          // add check for if site is excluded
        }
        // nothings on, do nothing 
        else {
          console.log('site not active')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
          turnIconOff();
        }
      });
    } else {
      console.log('low tabid')
    }
  });
}

chrome.webNavigation.onCommitted.addListener(function (info) {
  console.log('**************** on committed ****************');
  grayToggle(info);
});

// chrome.webNavigation.onCommitted.addListener(function (info) {
//   console.log('**************** on completed ****************');
//   console.log('info', info)
// });

chrome.tabs.onUpdated.addListener(function (tabId, info) {
  // console.log('**************** on completed ****************');
  // grayToggle(info);  
});

chrome.tabs.onActivated.addListener(function (info) {  
  console.log('**************** on tab activated ****************');
  grayToggle(info);
});