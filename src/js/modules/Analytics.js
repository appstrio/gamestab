window._gaq = window._gaq || [];

define(function AnalyticsModule(require) {
    var Config = require("Config");

    var Analytics = function Analytics() {
        var self = this;

        self.t1 = ["us", "ca", "uk", "gb"];
        self.t2 = ["fr", "de", "au", "at", "be", "dk", "fi", "is", "ie", "lu", "nl", "nz", "no", "ch", "se"];
        self.t3 = ["ar", "br", "bg", "ba", "cl", "hr", "cy", "cz", "ee", "ge", "gr", "hk", "hu", "it", "jp", "il", "lt", "ro", "sk", "sl", "es", "tr"];

        self.sEventValue = {
            t1: 40,
            t2: 20,
            t3: 8,
            t4: 2
        };
    };

    Analytics.prototype.getValByCC = function getCountryValueByCountryCode(cc) {
        for(var tier in this.sEventValue) {
            if(this.sEventValue.hasOwnProperty(tier)) {
                if(this[tier].indexOf(cc) !== -1) {
                    return this.sEventValue[tier];
                }
            }
        }
        return this.sEventValue.t4;
    };

    Analytics.prototype.sendEvent = function analyticsService_buildParamsFromEventID(params, done) {
        var self = this;
        if (!params.category || !params.action) return (done || null)();

        var category = params.category;
        var action = params.action;
        var label = params.label || "";
        var value = params.value;
        var optNonInteraction = params.opt_noninteraction || false;

        var arr = ["_trackEvent", category, action, label, value, optNonInteraction];
        return self.push(arr, done);
    };

    Analytics.prototype.sendCustomVar = function analyticsService_sendVarToArray(sendParams, done) {

        //validate required values exist
        if (typeof sendParams.index === "undefined" || !sendParams.name || typeof sendParams.value === "undefined") return false;

        //validate index is sane
        if (sendParams.index < 1 || sendParams.index > 5) return false;

        //fill in optional values if they don"t exist
        sendParams.opt_scope = sendParams.opt_scope || 3;

        //validate scope is sane
        if (sendParams.opt_scope < 1 || sendParams.opt_scope > 3) return false;

        var arr = ["_setCustomVar", sendParams.index, sendParams.name, sendParams.value.toString(), sendParams.opt_scope];
        return self.push(arr, done);

    };

    Analytics.prototype.push = function(arr, done) {
        // dismiss if background page
        //if(config.is_background_page) return (done||null)("bg dismissal");

        _gaq.push(arr);

        // if we want a "done" callback to be sent back to the caller
        if (done) {
            _gaq.push(function() {
                (done || null)();
            });
        }

    };

    Analytics.prototype.getEventValue = function(cc) {
        var self = this;
        // get cc if not cc, return t4
        if (!cc) return self.sEventValue["t4"];
        // find t value
        var t = "t4";
        if (self.t3.indexOf(cc) >= 0) t = "t3";
        if (self.t2.indexOf(cc) >= 0) t = "t2";
        if (self.t1.indexOf(cc) >= 0) t = "t1";
        // return event value
        return self.sEventValue[t];
    };

    Analytics.prototype.init = function(configData) {

        var self = this;

        self.googleAnalyticsUid = configData.google_analytics_uid;

        self.push(["_setAccount", self.googleAnalyticsUid]);

        var notBackgroundPage = document.URL.indexOf("background") === -1;
        notBackgroundPage && self.push(["_trackPageview"]);
        if (configData.ab_testing_group) {
            self.push(["_setCustomVar",
                1,
                "AB_TESTING",
                configData.ab_testing_group,
                1
            ]);
        }

        if (configData.install_week_number) {
            self.push(["_setCustomVar",
                2,
                "INSTALL_WEEK_NUMBER",
                configData.install_week_number,
                1
            ]);
        }
        if (configData.client_version) {
            self.push(["_setCustomVar",
                3,
                "REFERRAL",
                configData.referral,
                1
            ]);
        }

        if (configData.client_version) {
            self.push(["_setCustomVar",
                4,
                "CLIENT_VERSION",
                configData.client_version,
                1
            ]);
        }
        if (configData.superfish_enabled) {
            self.push(["_setCustomVar",
                5,
                "IS_SUPERFISH_COUNTRY", (configData.superfish_enabled) ? true : false,
                1
            ]);
        }
        if (document.URL.indexOf("#newtab") > -1) {
            self.sendEvent({
                category: "Pageload",
                action: "With Booster",
            });
        } else { //if (?) {
            self.sendEvent({
                category: "Pageload",
                action: "No Booster",
            });
        }

        (function() {
            var ga = document.createElement("script");
            ga.type = "text/javascript";
            ga.async = true;
            ga.src = "https://ssl.google-analytics.com/ga.js";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(ga, s);
        })();
    };

    var gaq = new Analytics();

    Config.promise.then(function(configData) {
        gaq.init(configData);
    });

    return gaq;
});
