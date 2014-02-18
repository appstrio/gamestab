angular.module('aio.settings').factory('Constants', ['Chrome',
    function (Chrome) {
        return {
            PARTNERS_JSON_URL: 'data/partners/partners.json',
            BACKGROUNDS_JSON_URL: 'https://s3.amazonaws.com/Gamestab/JSONs/backgrounds.json',
            WEB_APPS_DB: 'https://s3.amazonaws.com/Gamestab/JSONs/webAppsDb.json',
            DEFAULT_REMOTE_CONFIG: 'https://s3.amazonaws.com/Gamestab/JSONs/default-config.json',
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
                suggestions_url: 'http://api.bing.com/osjson.aspx?Market=en-us&query=',
                config_update_url: 'http://s3.amazonaws.com/Gamestab/JSONs/default-config.json',
                suggestions_type: 'bing',
                partner_id: 'default',
                dials_per_page: 12,
                initial_dials_size: 26,
                search_throttle_limit: 100,
                lazy_cache_dials_timeout: 10000,
                user_preferences: {
                    show_search_box: true
                }
            },
            DEBUG: {}
        };
    }
]);
