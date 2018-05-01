function updateStatus() {
    var checkbox = document.querySelector('.toggle-all');
    chrome.storage.sync.get(['gsAll', 'gsSites'], function (val) {
        if (val.gsAll) {
            checkbox.checked = false;
            chrome.storage.sync.set({ 'gsAll': false });
            // 'if site is added, don't remove it for this one'
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                var hostname = getDomainFromTabs(tabs);
                // console.log('hostname in popup', hostname);
                if (val.gsSites.indexOf(hostname) == -1) {
                    console.log('its not there', val.gsSites.indexOf(hostname));
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                    turnIconOff();
                }
            });
        } else {
            checkbox.checked = true;
            chrome.storage.sync.set({ 'gsAll': true });            
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
                turnIconOn();
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
document.querySelector('.toggle-all').addEventListener('change', updateStatus)

document.getElementById('add-site').addEventListener('click', addCurrentSite)
document.getElementById('remove-site').addEventListener('click', removeCurrentSite)

document.querySelector('.manage-sites').addEventListener('click', openOptionsPage)