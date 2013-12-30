
define(["env", "jquery", "Renderer", "when", "AndroIt","AndroidOverlay"], function AndroidDial(env, $, renderer, when, AndroIt,AndroidOverlay) {
    "use strict";

    if (window.DEBUG && window.DEBUGlogLoadOrder) console.log("Loading Module : AndroidDial");
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
