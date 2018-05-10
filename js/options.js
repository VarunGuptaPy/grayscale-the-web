var savedSites = ['reddit.com', 'ebay.com', 'facebook.com'];

updateOptionsSiteList();

chrome.extension.onMessage.addListener(function (request, sender, response) {
    console.log('message received')
    if (request.type === 'refreshOptions') {
        console.log('options message')
        updateOptionsSiteList();
    }
});

function toggleBackground() {
    console.log('toggle background');
    var checkbox = document.getElementById('background-toggle');
    chrome.storage.sync.get(['gsBgToggle'], function (val) {
        console.log('gsBgToggle', val.gsBgToggle);
        if (val.gsBgToggle) {
            console.log('checked')
            chrome.storage.sync.set({'gsBgToggle': false});
            checkbox.checked = false;
        } else {
            console.log('not checked');
            chrome.storage.sync.set({ 'gsBgToggle': true });
            checkbox.checked = true;
        }
    });

}

document.getElementById('saved-site-list').addEventListener('click', removeSiteFromList)

document.getElementById('save-new-site').addEventListener('click', addSiteToList);
document.getElementById('add-site-form').addEventListener('submit', addSiteToList);

document.getElementById('clear-site-values').addEventListener('click', clearSiteValues);

document.getElementById('excluded-site-list').addEventListener('click', removeExcludedSiteFromList)

document.getElementById('save-new-excluded-site').addEventListener('click', addExcludedSiteToList);
document.getElementById('add-excluded-site-form').addEventListener('submit', addExcludedSiteToList);

document.getElementById('clear-excluded-site-values').addEventListener('click', clearExcludedSiteValues);

document.getElementById('background-toggle').addEventListener('click', toggleBackground);

