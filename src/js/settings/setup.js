var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Apps', 'Config', '$log',
    function($rootScope, C, Apps, Config, $log) {

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {
            $log.log('[Setup] - starting setup');


            //TODO if setup alreadyh ran - return that

            // SETUP CONFIG
            return Config.setup()
                // .then(Preferences.setup)
                .then(angular.noop,
                    function(e) {
                        $log.warn('[Setup] - finished setup with error', e);
                        return e;
                    });
        };

        return {
            startSetup: startSetup
        };
    }
]);
