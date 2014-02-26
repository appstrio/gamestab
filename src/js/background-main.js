
var onCompleted = {
    handler: function (details) {
        console.log('Filename: background-main.js', 'Line: 3', 'details:', details);
    },
    filter: {
        urls: ['<all_urls>'],
        types: ['main_frame']
    }
};

chrome.webRequest.onCompleted.addListener(onCompleted.handler, onCompleted.filter);
