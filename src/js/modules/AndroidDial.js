
define(["env", "jquery", "Renderer", "when", "AndroIt","AndroidOverlay"], function DialContainer(env, $, renderer, when, AndroIt,AndroidOverlay) {
    "use strict";

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
    return function newDial(appID, title, icon, options) {
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
                appID: appID,
                title: title,
                icon: icon,
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
