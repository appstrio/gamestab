var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants', 'Apps', 'Config', 'Storage',
    function($rootScope, C, Apps, Config, Storage) {

        /**
         * Initiates Setup
         * @returns {promise}
         */
        var startSetup = function() {

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
