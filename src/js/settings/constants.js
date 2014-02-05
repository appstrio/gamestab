var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Constants', [
    function() {
        return {
            PARTNERS_JSON_URL: '/data/gamestab_remote.json',
            STORAGE_KEYS: {
                CONFIG: 'gt.config',
                ACCOUNT: 'gt.account'
            },
            ERRORS: {
                SETUP: {
                    NO_PUBLISHER_ID: 'NO_PUBLISHER_ID'
                }
            },
            CONFIG: {
                search_url: '',
                config_update_url: '',
                user_preferences: {
                    show_search_box: true
                }
            },
            DEBUG: {

            }
        };
    }
]);
