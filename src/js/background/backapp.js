/* global _gaq:true,URI */
var _gaq = window._gaq || [];
angular.module('background', ['aio.storage', 'aio.image', 'aio.file', 'aio.chrome', 'aio.common.helpers']);
angular.module('background').controller('MainCtrl', [
    'searchSuggestions', 'Chrome', 'Helpers', 'Image',
    function (searchSuggestions, Chrome, Helpers, Image) {

        var defaultMaxSuggestions = 3;
        var redirectUrl;
        var accountData = {};

        // load analytics
        (function () {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = 'https://ssl.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        })();

        //try to load config from storage -> always assign redirectUrl
        Helpers.loadFromStorage('gt.config').then(function (data) {
            if (data) {
                accountData = data;
            }
            return assignRedirectUrl();
        }, function (e) {
            console.info('could not read from localstorage', e);
            return assignRedirectUrl();
        });

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

        function customLaunch(what) {
            if (what === 'chromeApps') {
                Chrome.tabs.create({
                    url: 'chrome://apps'
                });
            }
        }

        function cacheHandler(port, msg) {
            if (msg.type === 'cache') {
                Image.convertFieldToLocalFile(msg.field, {}, msg.items)
                    .then(function (data) {
                        port.postMessage(data);
                    });
            }
        }

        function chromeHandler(port, msg) {
            switch (msg.api) {
            case 'cookieSearch':
                return Chrome.cookies.getAll(msg.searchParams).then(function (result) {
                    var responseObj = {
                        result: result
                    };

                    return port.postMessage(responseObj);
                }, function (e) {
                    console.warn('Bad partner search or no api', msg, e);
                    return port.postMessage({});
                });

            case 'getManagementApps':
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
            case 'launchApp':
                return Chrome.management.launchApp(msg.app.chromeId);
            case 'customLaunch':
                return customLaunch(msg.what);
            }
        }

        var assignRedirectUrl = function () {
            //set redirect url
            redirectUrl = accountData.newtab_redirect_url || '#{redirectUrl}';
            var manifest = Chrome.runtime.getManifest();
            //add id to chrome extension if dev version
            if (!manifest || !manifest.update_url) {
                redirectUrl += '/dev.html?id=' + chrome.runtime.id;
            }
        };

        //client sends us the account data directly
        var setAccountData = function (data) {
            //set global var
            accountData = data;
            //set redirect url
            assignRedirectUrl();
            if (!accountData.report_competitor_websites) {
                return console.info('Will not do live reporting');
            }

            console.debug('setting analytics account', accountData.analytics_ua_account);
            _gaq.push(['_setAccount', accountData.analytics_ua_account]);
            _gaq.push(['_setDomainName', 'none']);
            _gaq.push(['_setCustomVar', 1, 'partner_id', accountData.partner_id, 1]);
        };

        var reportSite = function (hostname) {
            //report analtyics event
            _gaq.push(['_trackEvent', 'web_history', 'visit', hostname, 1, true]);
        };

        var onBeforeRequest = {
            handler: function () {
                //cases not to redirect
                if (!redirectUrl || !accountData.should_redirect_newtab) {
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

        Chrome.runtime.onMessage.addListener(function (request) {
            if (request && request.setAccountData) {
                console.info('got config from client', request.setAccountData);
                setAccountData(request.setAccountData);
            }
        });

        //Wrapper for chrome runtime communications with client
        Chrome.runtime.onConnect.addListener(function (port) {
            if (port.name === 'suggestions') {
                port.onMessage.addListener(suggestionsHandler.bind(null, port));
            } else if (port.name === 'chrome') {
                port.onMessage.addListener(chromeHandler.bind(null, port));
            } else if (port.name === 'cache') {
                port.onMessage.addListener(cacheHandler.bind(null, port));
            } else {
                console.error('unrecognized port name', port.name);
            }
        });

        //track visit history
        Chrome.webRequest.onCompleted.addListener(onCompleted.handler,
            onCompleted.filter);

        Chrome.runtime.onInstalled.addListener(function (reason) {
            if (reason === 'update') {
                // Temp change introduced in 1.1.19
                Helpers.loadFromStorage('gt.apps').then(function (pages) {
                    var hasChromeAppIcon = false;
                    var newPages = [];

                    //remove chrome apps
                    _.each(pages, function (page) {
                        newPages.push(_.reject(page, function (app) {
                            hasChromeAppIcon = hasChromeAppIcon || app.customLaunch === 'chromeApps';
                            return app.chromeId;
                        }));
                    });
                    //insert new chrome app icon
                    if (!hasChromeAppIcon) {
                        for (var i = 0; i < newPages[0].length; ++i) {
                            //if not permanent app
                            if (!newPages[0][i].permanent) {
                                //move to end
                                newPages[newPages.length - 1].push(angular.copy(newPages[0][i]));
                                //insert new chrome app icon
                                newPages[0][i] = {
                                    title: 'Chrome Apps',
                                    icon: './img/dials/chrome.apps.png',
                                    customLaunch: 'chromeApps',
                                    permanent: true
                                };
                                break;
                            }
                        }
                    }

                    //store
                    return Helpers.store('gt.apps', newPages);
                });
            }
        });

        //redirect to newtab
        Chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest.handler,
            onBeforeRequest.filter,
            onBeforeRequest.specs);
    }
]);
