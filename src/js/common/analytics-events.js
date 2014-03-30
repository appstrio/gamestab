angular.module('aio.analyticsEvents', []);
angular.module('aio.analyticsEvents').factory('AnalyticsEvents', function () {
    var events = {
        101: {
            category: 'dials',
            action: 'dial_click'
        },
        102: {
            category: 'dials',
            action: 'dials_dragging'
        },
        103: {
            category: 'dials',
            action: 'remove_dial'
        },
        201: {
            category: 'partner_logo',
            action: 'click'
        },
        301: {
            category: 'search',
            action: 'search_complete'
        },
        302: {
            category: 'search',
            action: 'search_focus'
        },
        401: {
            category: 'navigation',
            action: 'navigation_clicked'
        },
        501: {
            category: 'app_load',
            action: 'load'
        },
        601: {
            category: 'appstore',
            action: 'open'
        },
        602: {
            category: 'appstore',
            action: 'category_click'
        },
        603: {
            category: 'appstore',
            action: 'add_new_dial'
        },
        701: {
            category: 'settings',
            action: 'open'
        },
        901: {
            category: 'chromeApps',
            action: 'open'
        },
        702: {
            category: 'settings',
            action: 'category_click'
        },
        703: {
            category: 'settings',
            action: 'show_search_box'
        },
        704: {
            category: 'settings',
            action: 'background_select'
        },
        705: {
            category: 'settings',
            action: 'background_upload'
        },
        510: {
            category: 'app_load',
            action: 'install'
        },
    };

    return events;
});
