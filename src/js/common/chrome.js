angular.module('aio.chrome', []);

angular.module('aio.chrome').factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        //detect if chrome
        var isChrome = (typeof chrome !== 'undefined');

        //detect if chrome extension
        var isExtension = isChrome && Boolean(chrome.extension);

        var history = {
            search: function (params) {
                var deferred = $q.defer();
                if (isChrome && chrome.history) {
                    chrome.history.search(params, function (results) {
                        $rootScope.$apply(function () {
                            if (results && results.length) {
                                deferred.resolve(results);
                            } else {
                                deferred.resolve();
                            }
                        });
                    });
                } else {
                    $log.warn('[Chrome] - no permission for chrome history');
                    deferred.reject();
                }
                return deferred.promise;
            }
        };

        var runtime = {
            onConnect: {
                addListener: function (cb) {
                    if (isChrome && chrome.runtime && chrome.runtime.onConnect) {
                        return chrome.runtime.onConnect.addListener(cb);
                    }
                    console.warn('no chrome api for runtime.onConnect');
                }
            },
            onMessage: {
                addListener: function (cb) {
                    if (isChrome && chrome.runtime && chrome.runtime.onMessage) {
                        return chrome.runtime.onMessage.addListener(cb);
                    }
                    console.warn('no chrome api for runtime.onMessage');
                }
            },
            getManifest: function () {
                if (isChrome && chrome.runtime && chrome.runtime.getManifest) {
                    return chrome.runtime.getManifest();
                }
                console.warn('no chrome api for runtime.getManifest');
            },
            onMessageExternal: {
                addListener: function (cb) {
                    if (isChrome && chrome.runtime && chrome.runtime.onMessageExternal) {
                        return chrome.runtime.onMessageExternal.addListener(cb);
                    }
                    console.warn('no chrome api for runtime.onMessageExternal');
                }
            }
        };

        var webRequest = {
            onCompleted: {
                addListener: function (handler, filter) {
                    if (isChrome && chrome.webRequest) {
                        return chrome.webRequest.onCompleted.addListener(handler, filter);
                    }
                    console.warn('no chrome api for webRequest');
                    return;
                }
            },
            onBeforeRequest: {
                addListener: function (handler, filter, specs) {
                    if (isChrome && chrome.webRequest) {
                        return chrome.webRequest.onBeforeRequest.addListener(handler, filter, specs);
                    }

                    console.warn('no chrome api for webRequest');
                    return;
                }
            }
        };

        var storage = {
            local: isChrome && chrome.storage && chrome.storage.local
        };

        var getUpdateUrl = function () {
            return isChrome && chrome.runtime && chrome.runtime.getManifest && chrome.runtime.getManifest().update_url;
        };
        var getVersion = function () {
            return isChrome && chrome.app && chrome.app.getDetails() && chrome.app.getDetails().version;
        };
        var management = {
            getAll: function () {
                var deferred = $q.defer();
                if (isChrome && chrome.management && chrome.management.getAll) {
                    chrome.management.getAll(function (results) {
                        $log.log('[Chrome] - got # chrome apps using management', results.length);
                        $rootScope.$apply(function () {
                            deferred.resolve(results);
                        });
                    });
                } else {
                    $log.warn('[Chrome] - no permission for chrome management');
                    deferred.reject();
                }

                return deferred.promise;
            },
            launchApp: function (chromeId) {
                var deferred = $q.defer();
                if (isChrome && chrome.management) {
                    chrome.management.launchApp(chromeId, function () {
                        $rootScope.$apply(function () {
                            deferred.resolve(chromeId);
                        });
                    });
                } else {
                    $log.warn('[Chrome] - no permission for chrome management');
                    deferred.reject();
                }

                return deferred.promise;
            }
        };
        var extension = {
            getURL: function (url) {
                if (isExtension) {
                    return chrome.extension.getURL(url);
                } else {
                    return 0;
                }
            }
        };

        return {
            isChrome: isChrome,
            getVersion: getVersion,
            isExtension: isExtension,
            management: management,
            extension: extension,
            storage: storage,
            getUpdateUrl: getUpdateUrl,
            history: history,
            runtime: runtime,
            webRequest: webRequest
        };
    }
]);
