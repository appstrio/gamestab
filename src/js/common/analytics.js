var analyticsModule = angular.module('aio.analytics', []);

analyticsModule.factory('Analytics', ['$rootScope', '$log', '$q',
    function ($rootScope, $log, $q) {

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

        var getEventArray = function (eventId, params) {
            

            return ['event']

        };
    }
]);
