console.log('Background.js fired');

chrome.storage.sync.set({ 'gsTabs': [] }, function(){
  console.log('cleared it out');
});

// chrome.webNavigation.onCommitted.addListener(function (info){
//   console.log('committed', info.tabId);
//   chrome.storage.sync.get(['gsTabs'], function (val) {
//     if (val.gsTabs.length < 1) {
//       console.log('gsTabs doesnt have anything set run other stuff');
//       // chrome.tabs.sendMessage(tab.id, { type: 'normalCheck' });
//     } else {
//       chrome.tabs.get(info.tabId, function (tab) {
//         console.log('tab.id', tab.id)
//         if (val.gsTabs && val.gsTabs.indexOf(tab.id) > -1) {
//           console.log('this tab active, go gray');
//           chrome.tabs.sendMessage(tab.id, { type: 'turnOnGray' });
//           turnIconOn();
//         } else {
//           console.log('tab not active, run other stuff')
//           // chrome.tabs.sendMessage(tab.id, { type: 'pageLoaded' });
//         }
//       });
//     }
//   });
// });

chrome.webNavigation.onCommitted.addListener(function (info) {
  console.log('**************** on committed ****************');
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {
    console.log('val.gsSites', val.gsSites);
    console.log('val.gsAll', val.gsAll);
    console.log('val.gsTabs', val.gsTabs);
    console.log('info', info)
    var tabId = info.tabId < 0 ? 0 : info.tabId;
    console.log('tabId after ternary', tabId)
    if (info.tabId > 0) {
      chrome.tabs.get(tabId, function (tab) {
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
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1){
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
});


chrome.runtime.onInstalled.addListener(function (details) {
  // turn on plugin when installed  
  // if (details.reason == "install") {
  //   // alert('installed') - need to use alert and remove and reload the unpacked extension when testing this
  //   chrome.storage.sync.set({ 'isActive': true });
  //   turnIconOn();
  // }
  // // if the extension is updated, check local storage to see if it's already active
  // if (details.reason == "update") {
  //   chrome.storage.sync.get('isActive', function (val) {
  //     if (val.isActive) {
  //       turnIconOn();
  //     } else {
  //       turnIconOff();
  //     }
  //   });
  // }
});

chrome.tabs.onActivated.addListener(function (info) {  
  console.log('**************** on tab activated ****************');
  // console.log('tab changed activeinfo', activeInfo)
  chrome.storage.sync.get(['gsSites', 'gsExcluded', 'gsAll', 'gsTabs'], function (val) {
    console.log('val.gsSites', val.gsSites);
    console.log('val.gsAll', val.gsAll);
    console.log('val.gsTabs', val.gsTabs);    
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
});