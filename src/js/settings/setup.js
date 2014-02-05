var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Apps', 'Config', '$log', 'Preferences',
    function($rootScope, C, Apps, Config, $log, Preferences) {

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {
            $log.log('Starting setup');

            // SETUP CONFIG
            return Config.setup()
                .then(Preferences.setup)
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
