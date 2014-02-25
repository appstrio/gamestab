angular.module('aio.settings').factory('Constants', ['Chrome',
    function (Chrome) {
        return {
            //partner list
            PARTNERS_JSON_URL: 'https://s3.amazonaws.com/Gamestab/JSONs/partners.json',
            //common web apps db
            WEB_APPS_DB: 'https://s3.amazonaws.com/Gamestab/JSONs/webAppsDb.json',
            //default config if not partner found
            DEFAULT_REMOTE_CONFIG: 'https://s3.amazonaws.com/Gamestab/JSONs/default_config.json',
            DEFAULT_BACKGROUND_URL: 'img/wallpapers/default.jpg',
            APP_VERSION: Chrome.getVersion(),
            STORAGE_KEYS: {
                CONFIG: 'gt.config',
                APPS: 'gt.apps',
                ACCOUNT: 'gt.account',
                BACKGROUNDS: 'gt.backgrounds',
                BACKGROUND: 'gt.background'
            },
            ERRORS: {
                SETUP: {
                    NO_PUBLISHER_ID: 'NO_PUBLISHER_ID'
                }
            },
            //default config. all of it can be overwritten by partner
            CONFIG: {
                //redirect to search url
                search_url: 'http://www.google.com/search?q=',
                //suggestions url
                suggestions_url: 'http://api.bing.com/osjson.aspx?Market=en-us&query=',
                //where to update from
                partner_config_json_url: 'http://s3.amazonaws.com/Gamestab/JSONs/default_config.json',
                //where to get backgrounds from
                backgrounds_json_url: 'https://s3.amazonaws.com/Gamestab/JSONs/backgrounds.json',
                analytics_ua_account: 'UA-47928276-1',
                suggestions_type: 'bing',
                partner_id: 'default',
                dials_per_page: 12,
                initial_dials_size: 26,
                search_throttle_limit: 100, //100 ms
                lazy_cache_dials_timeout: 10000, // 10 seconds
                config_expiration_time: 14400000, //4 hours
                user_preferences: {
                    show_search_box: true
                }
            },
            DEBUG: {}
        };
    }
]);
