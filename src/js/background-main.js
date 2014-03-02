/* global URI,_gaq:true */
(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

var accountData = {};

var setAccountData = function (data) {
    accountData = data;

    if (!accountData.report_competitor_websites) {
        console.info('Will not do live reporting');
        return;
    }

    console.debug('setting analytics account', accountData.analytics_ua_account);
    _gaq.push(['_setAccount', accountData.analytics_ua_account]);
    _gaq.push(['_setDomainName', 'none']);
    _gaq.push(['_setCustomVar', 1, 'partner_id', accountData.partner_id, 1]);
};

if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener(
        function (request) {
            if (request && request.setAccountData) {
                console.debug('Got data from client to setup account', accountData);
                setAccountData(request.setAccountData);
            }
        }
    );
}

var reportSite = function (hostname) {
    //report analtyics event
    _gaq.push(['_trackEvent', 'web_history', 'visit', hostname, 1, true]);
};

var onCompleted = {
    handler: function (details) {
        //don't report before got data from client
        if (!accountData.analytics_ua_account) {
            console.debug('not initiated yet');
            return;
        }

        if (!accountData.report_competitor_websites) {
            return;
        }

        var hostname = URI.parse(details.url).hostname;
        reportSite(hostname);
    },
    filter: {
        urls: ['http://*/*', 'https://*/*'],
        types: ['main_frame']
    }
};

if (typeof chrome !== 'undefined' && chrome.webRequest) {
    chrome.webRequest.onCompleted.addListener(onCompleted.handler, onCompleted.filter);
}
