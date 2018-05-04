// function toggleAllSites() {
//     var checkbox = document.getElementById('all-sites-toggle');
//     chrome.storage.sync.get(['gsAll', 'gsSites', 'gsTabs'], function (val) {
//         if (val.gsAll) {
//             checkbox.checked = false;
//             chrome.storage.sync.set({ 'gsAll': false });
//             // if site is added, don't remove it for this one
//             chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
//                 var hostname = getDomainFromTabs(tabs);
//                 console.log('gsTabs', val.gsTabs)
//                 // console.log('hostname in popup', hostname);
//                 if (val.gsSites.indexOf(hostname) == -1 && val.gsTabs.indexOf(tabs[0].id) == -1) {
//                     console.log('its not there', val.gsSites.indexOf(hostname), val.gsTabs.indexOf(tabs[0].id));
//                     chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
//                     turnIconOff();
//                 }
//             });
//         } else {
//             checkbox.checked = true;
//             chrome.storage.sync.set({ 'gsAll': true });            
//             chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
//                 chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
//                 turnIconOn();
//             });
//         }
//     });
// }

function toggleAllSites() {
    var checkbox = document.getElementById('all-sites-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
            var hostname = getDomainFromTabs(tabs);
            console.log('gsTabs', val.gsTabs)
            // console.log('hostname in popup', hostname);
            if (val.gsAll) {
                checkbox.checked = false;
                chrome.storage.sync.set({ 'gsAll': false });
                if (val.gsSites.indexOf(hostname) == -1 && val.gsTabs.indexOf(tabs[0].id) == -1) {
                    console.log('its not there', val.gsSites.indexOf(hostname), val.gsTabs.indexOf(tabs[0].id));
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                    turnIconOff();
                }
            } else {
                checkbox.checked = true;
                chrome.storage.sync.set({ 'gsAll': true });
                if (val.gsExcluded.indexOf(hostname) == -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
                    turnIconOn();
                }                
            }
        });
        
    });
}

function toggleTab() {
    console.log('toggle tab')
    var checkbox = document.getElementById('this-tab-toggle');
    chrome.storage.sync.get(['gsAll', 'gsExcluded', 'gsSites', 'gsTabs'], function (val) {
        if (checkbox.checked) {
            console.log('checked')
            // do callback here?            
            // if ()
            addCurrentTab();
        } else {
            console.log('not checked');
            // if gsall and gssites are both not set            
            // removeCurrentTab();
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                var hostname = getDomainFromTabs(tabs);
                removeCurrentTab();
                // console.log('gsSites', val.gsSites, 'gsAll', val.gsAll)
                // if (val.gsSites.indexOf(hostname) == -1 && !val.gsAll) {
                //     console.log('its not there', val.gsSites.indexOf(hostname), val.gsAll);
                //     chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                //     turnIconOff();
                // }
            });
        }
    });
    
}

function openOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function onLoad() {    
    var bodyEl = document.querySelector('body');
    updatePopUpDetails()
    setTimeout(() => {
        bodyEl.classList.remove('preload');
    }, 50);
}

onLoad();

document.getElementById('this-tab-toggle').addEventListener('change', toggleTab)
document.getElementById('all-sites-toggle').addEventListener('change', toggleAllSites)

document.getElementById('add-saved-site').addEventListener('click', addCurrentSite)
document.getElementById('remove-saved-site').addEventListener('click', removeCurrentSite)

document.getElementById('add-excluded-site').addEventListener('click', addCurrentSiteExcluded)
document.getElementById('remove-excluded-site').addEventListener('click', removeCurrentSiteExcluded)

document.querySelector('.manage-sites').addEventListener('click', openOptionsPage)