var savedSites = ['reddit.com', 'ebay.com', 'facebook.com'];

updateOptionsSiteList();

chrome.extension.onMessage.addListener(function (request, sender, response) {
    console.log('message received')
    if (request.type === 'refreshOptions') {
        console.log('options message')
        updateOptionsSiteList();
    }
});

document.getElementById('site-list').addEventListener('click', removeSiteFromList)

document.getElementById('save-new-site').addEventListener('click', addSiteToList);
document.getElementById('add-site-form').addEventListener('submit', addSiteToList);
document.getElementById('clear-site-values').addEventListener('click', clearSiteValues);
