
define(["env", "jquery", "Renderer", "when","AndroidOverlay"], function AndroidDial(env, $, renderer, when,AndroidOverlay) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : AndroidDial");
    return function newAndroidDial(appID, title, icon, options) {
        var self = {},
            options = options || {},
            dialArgs = arguments;

        var init = function initDial() {
            if (dialArgs[0] && !dialArgs[1] && !dialArgs[2]) {
                $.extend(self, dialArgs[0]);
            } else {
                $.extend(self, {
                    appID: appID,
                    title: title,
                    icon: icon,
                });
            }
        };

        self.toObject = function getDialInformation() {
            return {
                _type: "AndroidDial",
                appID: self.appID,
                title: self.title,
                icon : self.icon,
                class : 'android-dial'
            };
        };

        self.launch = function launchHandler(e) {
            e.stopPropagation();
            e.preventDefault();

            var overlay = new AndroidOverlay(self);

            return overlay.init();
        };

        init();

        return self;
    };
});
