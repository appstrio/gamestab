angular.module('aio.settings').factory('Constants', ['Chrome',
    function (Chrome) {
        return {
            //partner list
            PARTNERS_JSON_URL: 'https://s3.amazonaws.com/Gamestab/JSONs/partners.json',
            //common web apps db
            WEB_APPS_DB: 'https://s3.amazonaws.com/Gamestab/JSONs/webAppsDb.json',
            //default config if not partner found
            DEFAULT_REMOTE_CONFIG: 'https://s3.amazonaws.com/Gamestab/JSONs/default_config.json',
            //background to fallback in case partner json doesn't contain background image
            FALLBACK_BACKGROUND_URL: 'img/wallpapers/default.jpg',
            //app version is gotten from manifest
            APP_VERSION: Chrome.getVersion(),
            //storage keys to use
            STORAGE_KEYS: {
                CONFIG: 'gt.config',
                APPS: 'gt.apps',
                DELETED_APPS: 'gt.deleted.apps',
                ACCOUNT: 'gt.account',
                BACKGROUNDS: 'gt.backgrounds',
                //current active background
                BACKGROUND: 'gt.background'
            },
            ERRORS: {
                SETUP: {
                    NO_PUBLISHER_ID: 'NO_PUBLISHER_ID'
                }
            },
            // default config. all of it can be overriden by partner.
            CONFIG: {
                //redirect to search url
                search_url: 'http://www.google.com/search?q=',
                //suggestions url
                suggestions_url: 'http://api.bing.com/osjson.aspx?Market=en-us&query=',
                //where to update from
                partner_config_json_url: 'http://s3.amazonaws.com/Gamestab/JSONs/default_config.json',
                //should app show chrome apps
                use_chrome_apps: true,
                //where to get backgrounds from
                backgrounds_json_url: 'https://s3.amazonaws.com/Gamestab/JSONs/backgrounds.json',
                //whether to report user's surf to competitor's websites
                report_competitor_websites: true,
                //analytics UA account to use
                analytics_ua_account: 'UA-47928276-1',
                //what engine to use suggestions from
                suggestions_type: 'bing',
                //the partner id. this is the default
                partner_id: 'default',
                //how many dials should be displayed per page
                dials_per_page: 12,
                //maximum number of initial apps + partner apps + [other game apps]
                initial_dials_size: 26,
                //throttling limit for searches
                search_throttle_limit: 100, //100 ms
                //when to start lazy caching app icons after load
                lazy_cache_dials_timeout: 10000, // 10 seconds
                //how often should config be updated
                config_expiration_time: 14400000, //4 hours
                //when updating config from partner/default - override user preferences.
                //set to false unless you are sure
                override_user_preferences: false,
                //custom user preferences. can be overriden only by a switch
                user_preferences: {
                    //should the search box be shown
                    show_search_box: true
                }
            }
        };
    }
]);
