chrome.extension.onMessage.addListener(function (request, sender, response) {
    if (request.type === 'turnOnGray') {
        console.log('turn on gray')    
        document.querySelector('html').style.filter = "grayscale(100%)";
        chrome.storage.sync.get('gsBgToggle', function (val) {
            if (val.gsBgToggle) {
                document.querySelector('html').style.background = "#e2e2e2";
                document.querySelector('body').style.background = "#e2e2e2";
            }
        });        
    }
    if (request.type === 'turnOffGray') {
        console.log('turn off gray')
        document.querySelector('html').style.filter = "";
    }
});