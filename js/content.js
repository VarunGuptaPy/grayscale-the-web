chrome.extension.onMessage.addListener(function (request, sender, response) {
    // if (request.type === 'tabActivated') {
    //     console.log('tab activated')
    //     checkCurrentSite(window.location.href);
    //     // document.querySelector('html').style.filter = "grayscale(100%)";
    // }
    if (request.type === 'turnOnGray') {
        console.log('turn on gray')
        document.querySelector('html').style.filter = "grayscale(100%)";
    }
    if (request.type === 'turnOffGray') {
        console.log('turn off gray')
        document.querySelector('html').style.filter = "";
    }
});

var currentSite = document;
// var windowUrl = window.location.href

// console.log('currentSite', currentSite.querySelector('html'));
setTimeout(() => {
    checkCurrentSite(window.location.href);
}, 50);
