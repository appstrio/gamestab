'use strict';

define(['env', 'jquery', 'Renderer', 'Dial', 'when'], function(env, $, renderer, Dial, when) {
    if (env.DEBUG || env.logLoadOrder) console.log("Loading Module : AppDial");
    return function newAppDial(chromeId, title, icon, description, options) {
        var parent = Dial('', title, icon, {
            setEventHandlers: false
        }),
            options = options || {},
            self = Object.create(parent);

        var init = function initDial() {
            // var setEventHandlers = options.setEventHandlers || true;

            // check if passing object as first argument
            if (chromeId && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    chromeId: chromeId,
                    url: '',
                    description: description
                });
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

            chrome.management.launchApp(self.chromeId);
        };

        init();

        return self;
    };
});
