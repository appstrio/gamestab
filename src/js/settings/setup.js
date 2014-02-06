var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Apps', 'Config', '$log',
    function($rootScope, C, Apps, Config, $log) {

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {
            var t0 = Date.now();
            $log.log('[Setup] - starting setup');

            //TODO if setup alreadyh ran - return that

            // SETUP CONFIG
            return Config.setup()
            // .then(Preferences.setup)
            .then(function() {
                $log.log('[Setup] - Finished setup in ' + (Date.now() - t0) + ' ms.');
            }).then(angular.noop,
                function(e) {
                    $log.warn('[Setup] - Finished setup with error', e);
                    return e;
                });
        };

        return {
            startSetup: startSetup
        };
    }
]);
