var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Constants', ['Chrome',
    function (Chrome) {
        return {
            PARTNERS_JSON_URL: 'data/partners/partners.json',
            BACKGROUNDS_JSON_URL: 'https://s3.amazonaws.com/Gamestab/JSONs/backgrounds.json',
            WEB_APPS_DB: 'https://s3.amazonaws.com/Gamestab/JSONs/webAppsDb.json',
            DEFAULT_BACKGROUND_IMG: 'img/wallpapers/default.jpg',
            ANALYTICS_UA_ACCOUNT: 'UA-47928276-1',
            APP_VERSION: Chrome.getVersion(),
            STORAGE_KEYS: {
                CONFIG: 'gt.config',
                APPS: 'gt.apps',
                ACCOUNT: 'gt.account',
                BACKGROUNDS: 'gt.backgrounds'
            },
            ERRORS: {
                SETUP: {
                    NO_PUBLISHER_ID: 'NO_PUBLISHER_ID'
                }
            },
            CONFIG: {
                search_url: 'http://www.google.com/search?q=',
                suggestions_url : 'http://api.bing.com/osjson.aspx?Market=en-us&query=',
                suggestions_type : 'bing',
                config_update_url: '',
                dials_per_page: 12,
                initial_dials_size: 26,
                search_throttle_limit: 100,
                user_preferences: {
                    show_search_box: true
                }
            },
            DEBUG: {

            }
        };
    }
]);
