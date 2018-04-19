function coolBeans () {
    console.log('cool beans');
}

function addSite() {
    console.log('add site')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        console.log('tabs0', tabs[0])
        console.log('url', url)
        var hostname = extractRootDomain(url);
        console.log('hostname', hostname);
        chrome.storage.sync.get('gsSites', function (val) {
            console.log('gsSites', val)
            if (!val.gsSites || val.gsSites.length < 1) {
                console.log('gsSites doesnt exist yet, lets add it');
                chrome.storage.sync.set({ 'gsSites': [hostname] });
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            } else if (val.gsSites.indexOf(hostname) > -1) {
                console.log('sites is already added there')
            } else {
                console.log('site not there, add it')
                var newSiteList = val.gsSites;
                newSiteList.push(hostname);
                console.log('newSiteList', newSiteList)
                chrome.storage.sync.set({ 'gsSites': newSiteList }, function (result) {
                    console.log('result', result);
                });
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOnGray' });
            }
        });
    });
}

function removeSite() {
    console.log('remove site')
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        console.log('tabs0', tabs[0])
        console.log('url', url)
        var hostname = extractRootDomain(url);
        console.log('hostname', hostname)
        chrome.storage.sync.get('gsSites', function (val) {
            console.log('gsSites', val);
            // storage.set({ 'gsSites': [hostname] });
            if (!val.gsSites) {
                console.log('gsSites doesnt exist yet do nothing');
                // storage.set({ 'gsSites': [hostname] });
            } else if (val.gsSites.indexOf(hostname) > -1) {
                console.log('sites is already added there, remove it')
                var newSiteList = val.gsSites;
                var index = newSiteList.indexOf(hostname);
                newSiteList.splice(index, 1);
                console.log('newSiteList', newSiteList)
                chrome.storage.sync.set({ 'gsSites': newSiteList });
                chrome.tabs.sendMessage(tabs[0].id, { type: 'turnOffGray' });
            } else {
                console.log('site not there, do nothing')
                // var newSiteList = val.gsSites;
                // newSiteList.push(hostname);
                // console.log('newSiteList', newSiteList)
                // chrome.storage.sync.set({ 'gsSites': newSiteList }, function (result) {
                //     console.log('result', result);
                // });
            }
        });
    });
}

function showSiteValues(tabs) {
    chrome.storage.sync.get('gsSites', function (val) {
        console.log('showing gsSites', val.gsSites);        
        var ul = document.querySelector('.site-list');
        ul.innerHTML = "";

        if (val.gsSites.length < 1) {
            var li = document.createElement('li');
            li.innerHTML = "No Sites Saved";
            ul.appendChild(li);
        } else {
            val.gsSites.forEach(function (el) {
                var li = document.createElement('li');
                li.innerHTML = el;
                ul.appendChild(li);
            })
        }  
    });
}

function clearSiteValues(tabs) {
    chrome.storage.sync.get('gsSites', function (val) {
        console.log('showing gsSites before clearing', val.gsSites);
        chrome.storage.sync.set({ 'gsSites': [] });
    });
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