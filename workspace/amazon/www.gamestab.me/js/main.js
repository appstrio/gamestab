/* global ga */

(function (i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
    };
    i[r].l = 1 * new Date();
    a = s.createElement(o);
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-47928276-6', 'gamestab.me');
ga('send', 'pageview');

//use iife to not pollute global namespace
(function () {
    var partnersJson = '//s3.amazonaws.com/Gamestab/JSONs/partners.json';
    var partners = [];
    var subdomain;

    var getSubdomain = function (baseDomain) {
        if (!baseDomain) {
            return null;
        }
        var regSub = new RegExp('^((?!' + baseDomain + '|www)([^.]*))', 'g');
        var hostname = document.location.hostname || '';
        var _subdomain = hostname.match(regSub);
        if (_subdomain && _subdomain[0]) {
            return _subdomain[0];
        } else {
            return null;
        }
    };

    //get partner list
    $.getJSON(partnersJson).then(function (data) {
        console.info('got partners list');
        partners = data;
    }, function (e) {
        console.warn('error getting partner list', e);
    });

    $(document).ready(function () {
        var installUrl = 'https://chrome.google.com/webstore/detail/amlhfkalaoikfbpoolhpdhignhjhlhko';
        subdomain = getSubdomain('gamestab');

        var clearCookie = function () {
            document.cookie = 'app_id=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        };

        var addCookie = function (appId) {
            document.cookie = 'app_id=' + appId;
        };

        function chromeInstallSuccess() {
            console.info('Good Job!');
            //report install success
            ga('send', 'event', 'install-button', 'success', document.location.hostname);
        }

        function chromeInstallError() {
            console.info('Something blew up');
            //report install error
            ga('send', 'event', 'install-button', 'error', document.location.hostname);
            //clear cookie if exists
            clearCookie();
        }

        var addPartnerCookie = function () {
            //if on subdomain, and we have the partners list
            if (subdomain && partners.length) {
                var partner = partners.filter(function (element) {
                    return element.partner_id === subdomain;
                });

                if (partner && partner[0] && partner[0].app_id) {
                    console.info('added tag', partner[0].partner_id);
                    addCookie(partner[0].app_id);
                }
            }
        };

        var installButtonClicked = function (e) {
            e.stopPropagation();
            e.preventDefault();
            //report click on install button
            ga('send', 'event', 'install-button', 'click', document.location.hostname);
            //will add a partner cookie to configure app for him
            addPartnerCookie();
            chrome.webstore.install(installUrl, chromeInstallSuccess, chromeInstallError);
        };

        $('#install-button').on('click', installButtonClicked);
    });
})();
