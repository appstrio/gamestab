var _gaq = window._gaq || [];
angular.module('background', ['aio.storage', 'aio.image', 'aio.file', 'aio.chrome', 'aio.common.helpers']);

angular.module('background').controller('MainCtrl', [
    'searchSuggestions', 'Chrome', 'Helpers', 'Image',
    function (searchSuggestions, Chrome, Helpers, Image) {

        var defaultMaxSuggestions = 3;
        var redirectUrl; // = 'http://my.gamestab.me';

        //Handles communication with main extension about suggestions
        function suggestionsHandler(port, msg) {
            //get suggestions
            if (msg.type === 'get') {
                //has search val
                if (msg.searchVal) {
                    searchSuggestions.getResults(msg.searchVal).then(function (data) {
                        var howMany = msg.howMany || defaultMaxSuggestions;
                        var returnResults = _.first(data, howMany);
                        var postObj = {
                            searchResults: returnResults
                        };
                        port.postMessage(postObj);
                    });
                }
            } else if (msg.type === 'init') {
                if (msg.params) {
                    searchSuggestions.init(msg.params);
                }
            }
        }

        function chromeHandler(port, msg) {
            if (msg.api === 'historySearch') {
                Chrome.history.search(msg.searchParams).then(function (result) {
                    var responseObj = {
                        partner_id: msg.partner_id,
                        result: result
                    };
                    return port.postMessage(responseObj);
                }, function (e) {
                    console.warn('Bad partner search or no api', msg.partner_id, e);
                    return port.postMessage({
                        partner_id: msg.partner_id
                    });
                });
            } else if (msg.api === 'getManagementApps') {
                return Chrome.management.getAll().then(function (results) {
                    var chromeApps = [];
                    if (results && results.length) {
                        //filter apps & convert to object
                        chromeApps = _.filter(results, Helpers.isAppEnabled);
                        chromeApps = _.map(chromeApps, Helpers.chromeAppToObject);
                        Image.convertFieldToLocalFile('icon', {}, chromeApps).then(function (cachedChromeApps) {
                            var responseObj = {
                                api: 'getManagementApps',
                                results: cachedChromeApps
                            };
                            port.postMessage(responseObj);
                        });
                    }
                });
            }
        }

        //Wrapper for chrome runtime communications with client
        Chrome.runtime.onConnect.addListener(function (port) {
            if (port.name === 'suggestions') {
                port.onMessage.addListener(suggestionsHandler.bind(null, port));
            } else if (port.name === 'chrome') {
                port.onMessage.addListener(chromeHandler.bind(null, port));
            } else {
                console.error('unrecognized port name', port.name);
            }
        });

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

            //set redirect url
            redirectUrl = accountData.newtab_redirect_url || 'http://my.gamestab.me';

            var manifest = Chrome.runtime.getManifest();
            //add id to chrome extension if dev version
            if (!manifest || !manifest.update_url) {
                redirectUrl += '/dev.html?id=' + chrome.runtime.id;
            }

            if (!accountData.report_competitor_websites) {
                console.info('Will not do live reporting');
                return;
            }

            console.debug('setting analytics account', accountData.analytics_ua_account);
            _gaq.push(['_setAccount', accountData.analytics_ua_account]);
            _gaq.push(['_setDomainName', 'none']);
            _gaq.push(['_setCustomVar', 1, 'partner_id', accountData.partner_id, 1]);
        };

        Chrome.runtime.onMessage.addListener(function (request) {
            if (request && request.setAccountData) {
                console.info('got config from client', request.setAccountData);
                setAccountData(request.setAccountData);
            }
        });

        var reportSite = function (hostname) {
            //report analtyics event
            _gaq.push(['_trackEvent', 'web_history', 'visit', hostname, 1, true]);
        };

        var onBeforeRequest = {
            handler: function () {
                if (!redirectUrl) {
                    return;
                }

                return {
                    redirectUrl: redirectUrl
                };
            },
            filter: {
                urls: ['chrome-extension://' + chrome.runtime.id + '/newtab.html'],
                types: ['main_frame']
            },
            specs: ['blocking']
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

        Chrome.webRequest.onCompleted.addListener(onCompleted.handler,
            onCompleted.filter);

        Chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest.handler,
            onBeforeRequest.filter,
            onBeforeRequest.specs);
    }
]);
