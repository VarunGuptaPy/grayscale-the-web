chrome.extension.onMessage.addListener(function (request, sender, response) {
    if (request.type === 'turnOnGray') {
        // console.log('turn on gray')
        document.querySelector('html').style.filter = "grayscale(100%)";
    }
    if (request.type === 'turnOffGray') {
        // console.log('turn off gray')
        document.querySelector('html').style.filter = "";
    }
    // if (request.type === 'pageLoaded') {
    //     console.log('page loaded', sender.tab.id)
    //     tabId = sender.tab.id;
        // checkCurrentSite(document, window.location.href);
    // }
});

// setTimeout(() => {
    // checkCurrentSite(document, window.location.href);
// }, 50);