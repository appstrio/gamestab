var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Apps', 'Config', '$log',
    function($rootScope, C, Apps, Config, $log) {

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {
            $log.log('[Setup] - starting setup');

            // SETUP CONFIG
            return Config.setup()
                // .then(Preferences.setup)
                .then(angular.noop,
                    function(e) {
                        return e;
                    });
        };

        return {
            startSetup: startSetup
        };
    }
]);
