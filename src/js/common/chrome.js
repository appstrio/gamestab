angular.module('aio.chrome').factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        return {
            history: {
                search: function (params) {
                    var deferred = $q.defer();
                    if (chrome && chrome.history) {
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
            },
            storage: {
                local: chrome.storage.local
            },
            getUpdateUrl: function () {
                return chrome.runtime.getManifest().update_url;
            },
            getVersion: function () {
                return chrome.app.getDetails().version;
            },
            management: {
                getAll: function () {
                    var deferred = $q.defer();
                    if (chrome && chrome.management && chrome.management.getAll) {
                        chrome.management.getAll(function (results) {
                            $log.log('[Chrome] - got # chrome apps using management', results.length);
                            $rootScope.$apply(function () {
                                deferred.resolve(results);
                            });
                        });
                    } else {
                        $log.warn('[Chrome] - no permission for chrome management');
                        $rootScope.$apply(function () {
                            deferred.resolve();
                        });
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
            },
            extension: {
                getURL: function (url) {
                    if (chrome && chrome.extension) {
                        return chrome.extension.getURL(url);
                    } else {
                        return 0;
                    }
                }
            },
            isChrome: function () {
                return chrome && !! chrome.extension;
            }
        };
    }
]);
