var chromeModule = angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope', '$timeout', '$q', '$log',
    function ($rootScope, $timeout, $q, $log) {
        return {
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
                }
            }
        };
    }
]);
