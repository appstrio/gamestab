'use strict';

define(['env', 'jquery', 'Renderer', 'Dial', 'when'], function(env, $, renderer, Dial, when) {
    if (DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : AppDial");
    return function newAppDial(chromeId, title, icon, description, options) {
        var parent = Dial('', title, icon, {
            isParent : true
        }),
            self = Object.create(parent),
            options = options || {};

        var init = function initDial() {
            // check if passing object as first argument
            if (chromeId && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    chromeId: chromeId,
                    description: description
                });

            if (DEBUG && !options.isParent) {
                if (!self.chromeId || !self.description ) {
                    console.warn("newAppDial ERROR");
                }
            }
        };

        self.toObject = function getDialInformation() {
            return {
                url: self.url,
                title: self.title,
                icon: self.icon,
                chromeId: self.chromeId
            };
        }

        self.launch = function launchHandler(e) {
            e.stopPropagation();
            e.preventDefault();

            Analytics.sendEvent({
                category: "Dial",
                action: "Launch",
                label: dial.title + ":" + dial.chromeId,
            }, def.resolve);

            chrome.management.launchApp(self.chromeId);
        };

        init();

        return self;
    };
});
