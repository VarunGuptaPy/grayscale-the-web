// console.log('Background.js fired');

// Clear out gsTabs when chrome is closed
chrome.storage.sync.set({ 'gsTabs': [] });

function grayToggle(info) {
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {
    // console.log('gsSites', val.gsSites);
    // console.log('gsExcluded', val.gsExcluded);
    // console.log('gsAll', val.gsAll);
    // console.log('gsTabs', val.gsTabs);
    // console.log('tabid', info.tabId);
    chrome.tabs.get(info.tabId, function (tab) {
      // console.log('chrome.tabs.get tab', tab)
      var url = tab.url;
      var hostname = extractRootDomain(url);
      // console.log('tab hostname', hostname);
      if (tab.id !== -1) {
        // console.log('good to check')
        
        // Check if options page
        if (url === chrome.runtime.getURL('options.html')) {
          // console.log('On the options page');
          chrome.runtime.sendMessage({ type: 'refreshOptions' });
        }
        // Check if this site is saved
        else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
          // console.log('site saved')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
          turnIconOn();
        }
        // Check if this tab is on
        else if (val.gsTabs && val.gsTabs.indexOf(tab.id) > -1) {
          // console.log('tab active')
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            // console.log('tab is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            // console.log('tab is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
        }
        // Check if all sites toggle on
        else if (val.gsAll) {
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            // console.log('all sites is on, but site is excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
            turnIconOff();
          } else {
            // console.log('all sites is on, site is NOT excluded')
            chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
            turnIconOn();
          }
        }
        // Nothing's on, make sure gray is off
        else {
          // console.log('not active')
          chrome.tabs.sendMessage(tab.id, { type: 'turnOffGray' });
          turnIconOff();
        }
      } 
    });    
  });
}

chrome.webNavigation.onCommitted.addListener(function (info) {
  // console.log('**************** on committed ****************');
  grayToggle(info);
});

chrome.tabs.onActivated.addListener(function (info) {  
  // console.log('**************** on tab activated ****************');
  grayToggle(info);
});