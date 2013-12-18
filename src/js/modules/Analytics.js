window._gaq = window._gaq || [];

define(['promise!runtime
', 'promise!config'], function Analytics(runtime, config) {
    /**
     * GOOGLE ANALYTICS EVENTS AND CUSTOM VARS
     *
     * - CUSTOM VARS :
     * --- KEY #1 : AB_TESTING
     * ----- VALUE : "A"
     * ---- VALUE : "B"
     * --- KEY #2 : INSTALL_WEEK_NUMBER
     * ----- VALUE : THE WEEK COUNT OUT OF 52
     * --- KEY #3 :
     * --- KEY #4 : CLIENT_VERSION
     * ----- VALUE : CHROME WEBSTORE VERSION
     *
     * - EVENTS :
     * --- EVENT CATEGORY : "Search"
     * ----- EVENT ACTION : "Search"
     * ------- EVENT LABEL : THE SEARCH QUERY
     */
    var self = {};

    self.runtime = runtime;

    self.sendEvent = function analyticsService_buildParamsFromEventID(params, done) {
        if (!params.category || !params.action) return done && done();

        var category = params.category;
        var action = params.action;
        var label = params.label || '';
        var value = params.value;
        var optNonInteraction = params.opt_noninteraction || false;

        var arr = ['_trackEvent', category, action, label, value, optNonInteraction];
        return self.push(arr, done);
    };


    self.sendCustomVar = function analyticsService_sendVarToArray(sendParams, done) {
        //validate required values exist
        if (typeof sendParams.index === 'undefined' || !sendParams.name || typeof sendParams.value === 'undefined') return false;

        //validate index is sane
        if (sendParams.index < 1 || sendParams.index > 5) return false;

        //fill in optional values if they don't exist
        sendParams.opt_scope = sendParams.opt_scope || 3;

        //validate scope is sane
        if (sendParams.opt_scope < 1 || sendParams.opt_scope > 3) return false;

        var arr = ['_setCustomVar', sendParams.index, sendParams.name, sendParams.value.toString(), sendParams.opt_scope];
        return self.push(arr, done);

    };

    self.push = function(arr, done) {
        // dismiss if background page
        //if(config.is_background_page) return (done||angular.noop)('bg dismissal');

        _gaq.push(arr);

        // if we want a 'done' callback to be sent back to the caller
        if (done) {
            _gaq.push(function() {
                (done || common.noop)();
            });
        }

    };

    self.getEventValue = function(cc) {
        // get cc if not cc, return t4
        if (!cc) return self.sEventValue['t4'];
        // find t value
        var t = 't4';
        if (self.t3.indexOf(cc) >= 0) t = 't3';
        if (self.t2.indexOf(cc) >= 0) t = 't2';
        if (self.t1.indexOf(cc) >= 0) t = 't1';
        // return event value
        return self.sEventValue[t];
    };

    self.init = (function () {
        if (typeof self.runtime.runtime.location.country.short_name !== 'undefined')
            self.cc = runtime.runtime.location.country.short_name;
        self.t1 = ['us', 'ca', 'uk', 'gb'];
        self.t2 = ['fr', 'de', 'au', 'at', 'be', 'dk', 'fi', 'is', 'ie', 'lu', 'nl', 'nz', 'no', 'ch', 'se'];
        self.t3 = ['ar', 'br', 'bg', 'ba', 'cl', 'hr', 'cy', 'cz', 'ee', 'ge', 'gr', 'hk', 'hu', 'it', 'jp', 'il', 'lt', 'ro', 'sk', 'sl', 'es', 'tr'];

        self.sEventValue = {
            t1: 4,
            t2: 2,
            t3: 0.8,
            t4: 0.2
        };

        self.googleAnalyticsUid = config.config.google_analytics_uid;

        self.push(['_setAccount', self.googleAnalyticsUid]);
        self.push(['_trackPageview']);

        if (config.config.ab_testing_group) {
            self.push(['_setCustomVar',
                1,
                'AB_TESTING',
                config.config.ab_testing_group,
                1
            ]);
        }

        if (config.config.install_week_number) {
            self.push(['_setCustomVar',
                2,
                'INSTALL_WEEK_NUMBER',
                config.config.install_week_number,
                1
            ]);
        }

        if (config.config.client_version) {
            self.push(['_setCustomVar',
                4,
                'CLIENT_VERSION',
                config.config.client_version,
                1
            ]);
        }


        if (config.config.superfish_enabled) {
            self.push(['_setCustomVar',
                5,
                'IS_SUPERFISH_COUNTRY', (config.config.superfish_enabled) ? true : false,
                1
            ]);
        }

        if (document.URL.indexOf('#newtab') > -1) {
            self.sendEvent({
                category: 'Pageload',
                action: 'with booster',
                label: 'with booster'
            });
        }

        (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = 'https://ssl.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        })();
    })();

    return self;
});
