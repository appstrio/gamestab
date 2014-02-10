var analyticsModule = angular.module('aio.analytics', []);

//global
var _gaq = _gaq || [];

analyticsModule.factory('Analytics', ['$rootScope', '$log', '$q', 'Constants',
    function ($rootScope, $log, $q, C) {
        /**
         * init
         * Load the analytics script
         *
         * @return
         */
        var init = function () {
            $log.log('[Analytics] - loading analytics script with Account: ' + C.ANALYTICS_UA_ACCOUNT);
            //init account
            (function () {
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = 'https://ssl.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);
            })();

            _gaq.push(['_setAccount', C.ANALYTICS_UA_ACCOUNT]);
            _gaq.push(['_setDomainName', 'none']);
            //track pageview
            _gaq.push(['_trackPageview']);
            $log.log('[Analytics] - done loading...');
        };

        var events = {
            101: {
                'Category': 'dials',
                'Action': 'dial_click'
            },
            102: {
                'Category': 'dials',
                'Action': 'dials_dragging'
            },
            103: {
                'Category': 'dials',
                'Action': 'remove_dial'
            },
            201: {
                'Category': 'partner_logo',
                'Action': 'click'
            },
            301: {
                'Category': 'search',
                'Action': 'search_complete'
            },
            302: {
                'Category': 'search',
                'Action': 'search_focus'
            },
            401: {
                'Category': 'navigation',
                'Action': 'navigation_clicked'
            },
            501: {
                'Category': 'page_load',
                'Action': 'load'
            },
            601: {
                'Category': 'appstore',
                'Action': 'open'
            },
            602: {
                'Category': 'appstore',
                'Action': 'category_click'
            },
            603: {
                'Category': 'appstore',
                'Action': 'add_new_dial'
            },
            701: {
                'Category': 'settings',
                'Action': 'open'
            },
            702: {
                'Category': 'settings',
                'Action': 'category_click'
            },
            703: {
                'Category': 'settings',
                'Action': 'show_search'
            },
            704: {
                'Category': 'settings',
                'Action': 'background_select'
            },
            705: {
                'Category': 'settings',
                'Action': 'background_upload'
            }
        };

        var getEventArray = function (eventId, params) {};


        return {
            init: init
        };
    }
]);
