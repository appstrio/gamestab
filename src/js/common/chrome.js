var chromeModule = angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        return {
            history: {
                search: function (params, cb) {
                    if (chrome && chrome.history) {
                        chrome.history.search(params, cb);
                    } else {
                        $log.warn('[Chrome] - no permission for chrome history');
                        cb();
                    }
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
                launchApp: function (app) {
                    var deferred = $q.defer();
                    chrome.management.launchApp(app.chromeId, function () {
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
            isChrome : function(){
                return chrome && chrome.extension;
            }
        };
    }
]);
