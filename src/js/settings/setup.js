var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Config', '$log', 'Storage', '$q',
    function($rootScope, C, Config, $log, Storage, $q) {
        var storageKey = C.STORAGE_KEYS.CONFIG;

        /**
         * loadFromStorage
         * Try to load key from local storage.
         *
         * @return promise
         */
        var loadFromStorage = function() {
            var deferred = $q.defer();

            Storage.get(storageKey, function(items) {
                if (items && items[storageKey]) {
                    $log.log('[Config] - got settings from localstorage');
                    Config.set(items[storageKey]);
                    return deferred.resolve(Config.get());
                }

                $log.log('[Config] - did not find local settings. getting from remote.');
                return deferred.reject();
            });

            return deferred.promise;
        };

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {
            $log.log('[Setup] - starting setup');

            //TODO if setup alreadyh ran - return that

            // SETUP CONFIG
            return loadFromStorage()
                .then(angular.noop, Config.setup)
                .then(function() {
                    $log.log('[Setup] - finished setup');
                    return;
                }, function(e) {
                    $log.warn('[Setup] - Finished setup with error', e);
                    return e;
                });
        };

        return {
            startSetup: startSetup
        };
    }
]);
