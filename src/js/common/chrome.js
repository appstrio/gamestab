var chromeModule = angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        return {
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
                        $log.log('[Chrome] - no permission for chrome management');
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
            }
        };
    }
]);
