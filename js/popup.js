function updateStatus() {
    var storage = chrome.storage.sync;
    var checkbox = document.querySelector('.toggle-all');
    storage.get('gsAll', function (val) {
        if (val.gsAll) {
            checkbox.checked = false;
            storage.set({ 'gsAll': false });
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                // need to check url to base if we're going to turn it off here???
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
            });
        } else {
            checkbox.checked = true;
            storage.set({ 'gsAll': true });            
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            });
        }
    });
}

function onLoad() {
    var checkbox = document.querySelector('.toggle');
    var bodyEl = document.querySelector('body');
    chrome.storage.sync.get('gsAll', function (val) {
        if (val.gsAll) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    setTimeout(() => {
        bodyEl.classList.remove('preload');
    }, 50);
}

onLoad();
document.querySelector('.toggle-all').addEventListener('change', updateStatus)

document.querySelector('.add-site').addEventListener('click', addSite)
document.querySelector('.remove-site').addEventListener('click', removeSite)
document.querySelector('.show-site-values').addEventListener('click', showSiteValues)
document.querySelector('.clear-site-values').addEventListener('click', clearSiteValues)

document.querySelector('.all-sites').addEventListener('click', allSites)