function checkCurrentSite(siteUrl) {
    console.log('check current site run')
    chrome.storage.sync.get(['gsSites', 'gsAll'], function (val) {
        // console.log('val.gsSites', val.gsSites);
        // console.log('val.gsAll', val.gsAll);
        var hostname = extractRootDomain(siteUrl);
        console.log('activated url', hostname)
        if (val.gsAll) {
            console.log('turn on gray first')
            currentSite.querySelector('html').style.filter = "grayscale(100%)";
        } else if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
            console.log('site active')
            console.log('turn on gray first')
            currentSite.querySelector('html').style.filter = "grayscale(100%)";
        } else {
            console.log('site not active')
            console.log('turn off gray first')
            console.log('chrome.browserAction', chrome.browserAction)
            currentSite.querySelector('html').style.filter = "";
        }
    });
}

// ****************************
// Add saved sites
// ****************************

function addSite(site, tabs, callback) {
    chrome.storage.sync.get('gsSites', function (val) {
        console.log('gsSites', val)
        if (!val.gsSites || val.gsSites.length < 1) {
            console.log('gsSites doesnt exist yet, lets add it');
            chrome.storage.sync.set({ 'gsSites': [site] }, function () {
                callback();
            });
        } else if (val.gsSites.indexOf(site) > -1) {
            console.log('sites is already added there')
        } else {
            console.log('site not there, add it')
            var newSiteList = val.gsSites;
            newSiteList.push(site);
            newSiteList.sort();
            console.log('newSiteList', newSiteList)
            chrome.storage.sync.set({ 'gsSites': newSiteList }, function () {
                callback();
            });
        }
    });
}

function addCurrentSite() {
    console.log('add current site')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        addSite(hostname, tabs, function () {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            turnIconOn();
            updatePopUpDetails();
        });
    });
}

function addSiteToList(e) {
    e.preventDefault();
    console.log('form go')
    var newSite = document.getElementById('new-site');
    var errorMessage = document.querySelector('.error-message');
    if (/^[a-zA-Z0-9]{1,}\.[a-zA-Z]{2,}$/.test(newSite.value)) {
        errorMessage.classList.remove('error-message--show');
        var newDomain = extractRootDomain(newSite.value);
        addSite(newDomain, false, updateOptionsSiteList);
        newSite.value = '';
        newSite.blur();
        newSite.focus();
    } else {
        errorMessage.classList.add('error-message--show');
        newSite.blur();
        newSite.focus();
    }
}


// ****************************
// Remove saved sites
// ****************************

function removeSite(site, tabs, callback){
    chrome.storage.sync.get('gsSites', function (val) {
        console.log('gsSites', val);
        if (!val.gsSites) {
            console.log('gsSites doesnt exist yet do nothing');
        } else if (val.gsSites.indexOf(site) > -1) {
            console.log('sites is already added there, remove it')
            var newSiteList = val.gsSites;
            var index = newSiteList.indexOf(site);
            newSiteList.splice(index, 1);
            console.log('newSiteList', newSiteList)
            chrome.storage.sync.set({ 'gsSites': newSiteList }, function (){
                if(callback) {
                    callback()
                }
            });
            if (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
                turnIconOff();
            }                        
        } else {
            console.log('site not there, do nothing')
        }
    });
}

function removeCurrentSite() {
    console.log('remove current site')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        var hostname = extractRootDomain(url);
        removeSite(hostname, tabs, updatePopUpDetails);
    });
}

function removeSiteFromList(e) {
    var siteName = e.target.getAttribute('data-site');
    removeSite(siteName, false, updateOptionsSiteList);
}

// ****************************
// Toggle icon functions
// ****************************

function turnIconOn() {
    chrome.browserAction.setIcon({
        path: "../img/gs-logo-on.png"
    });
}

function turnIconOff() {
    chrome.browserAction.setIcon({
        path: "../img/gs-logo-off.png"
    });
}

// ****************************
// Refresh options and popup pages
// ****************************

function updatePopUpDetails() {
    var checkbox = document.querySelector('.toggle');
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var hostname = getDomainFromTabs(tabs);
        var siteTitle = document.getElementById('site-name');
        siteTitle.innerHTML = hostname;
        var siteStatus = document.getElementById('site-status');
        var addRemoveContainer = document.querySelector('.add-remove-container');
        var popUpContainer = document.querySelector('.container');
        if (tabs[0].url === chrome.runtime.getURL('options.html')) {
            popUpContainer.classList.add('container--options');
        }
        chrome.storage.sync.get(['gsAll', 'gsSites'], function (val) {
            if (val.gsAll) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
            if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
                siteStatus.innerHTML = 'is saved.'
                addRemoveContainer.classList.add('add-remove-container--remove');
            } else {
                siteStatus.innerHTML = 'is not saved.'
                addRemoveContainer.classList.remove('add-remove-container--remove');
            }
        });
    });
}

// options.js, and here in others
function updateOptionsSiteList() {
    chrome.storage.sync.get('gsSites', function (val) {
        console.log('showing gsSites', val.gsSites);
        var ul = document.getElementById('site-list');
        ul.innerHTML = "";

        if (val.gsSites.length < 1) {
            var li = document.createElement('li');
            li.innerHTML = "No sites saved yet. Use the form above or the extension pop up by clicking the icon in the chrome menu bar while browsing to add some!";
            ul.appendChild(li);
        } else {
            val.gsSites.forEach(function (el) {
                var li = document.createElement('li');
                var itemText = `<button class="remove-button" data-site="${el}">X</button> ${el}`
                li.innerHTML = itemText;
                ul.appendChild(li);
            })
        }
    });
}

// ****************************
// Clear sites
// ****************************

// only options.js
function clearSiteValues(tabs) {
    if (confirm('Are you sure you want to remove all of your saved sites?')) {
        chrome.storage.sync.get('gsSites', function (val) {
            console.log('showing gsSites before clearing', val.gsSites);
            chrome.storage.sync.set({ 'gsSites': [] });
            updateOptionsSiteList();
        });
    }
}

// **************
// URL Helpers
// **************

function getDomainFromTabs(tabs) {
    var url = tabs[0].url;
    var hostname = extractRootDomain(url);    
    return hostname;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}