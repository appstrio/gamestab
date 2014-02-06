var chromeModule = angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
        return {
            management: {
                getAll: function(cb) {
                    if (chrome && chrome.management && chrome.management.getAll) {
                        return chrome.management.getAll(function(results) {
                            $rootScope.$apply(function() {
                                cb && cb(results);
                            });
                        });
                    } else {
                        $timeout(cb, 0);
                    }
                }
            }
        };
    }
]);
