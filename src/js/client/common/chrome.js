angular.module('aio.chrome').factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        //detect if chrome
        var isChrome = typeof chrome !== 'undefined';

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
        var storage = {
            local: chrome.storage.local
        };
        var getUpdateUrl = function () {
            return chrome.runtime.getManifest().update_url;
        };
        var getVersion = function () {
            return chrome.app.getDetails().version;
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
                    deferred.resolve();
                }

                return deferred.promise;
            },
            launchApp: function (chromeId) {
                var deferred = $q.defer();
                chrome.management.launchApp(chromeId, function () {
                    $rootScope.$apply(function () {
                        deferred.resolve();
                    });
                });

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
            isExtension: isExtension,
            management: management,
            extension: extension,
            storage: storage,
            getUpdateUrl: getUpdateUrl,
            getVersion: getVersion,
            history: history
        };
    }
]);
