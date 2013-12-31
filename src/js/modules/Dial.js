define(["env", "jquery", "Renderer", "when", "Analytics"], function DialContainer(env, $, renderer, when, Analytics) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : DialContainer");

    return function newDial(url, title, icon, options) {
        var self = {
            url: "",
            id: "",
        },
            options = options || {};

        var init = function initDial() {
            // check if passing object as first argument
            if (url && !title && !icon) $.extend(self, url);
            else {
                $.extend(self, {
                    url: url,
                    title: title,
                    icon: icon
                });
            }

            if (DEBUG && !options.isParent) {
                if (!self.url || !self.title || !self.icon) {
                    console.warn("newDial ERROR");
                }
            }
        }

        self.toObject = function getDialInformation() {
            return {
                _type: "Dial",
                url: self.url,
                title: self.title,
                icon: self.icon,
            };
        }

        self.launch = function launchHandler(e) {
            e.stopPropagation();
            e.preventDefault();

            var url = $(e.currentTarget).find("a").attr("href");

            Analytics.sendEvent({
                category: "Dial",
                action: "Launch",
                label: url,
            }, function() {
                window.location.href = url;
            });
        };


        init();

        return self;
    };
});
