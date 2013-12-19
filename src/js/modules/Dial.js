"use strict";

define(['env', 'jquery', 'Renderer', 'when'], function DialContainer(env, $, renderer, when) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
    return function newDial(url, title, icon, options) {
        var self = {},
            options = options || {};

        var init = function initDial() {;
            // var setEventHandlers = options.setEventHandlers || true;

            // check if passing object as first argument
            if (url && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    url: '',
                    title: title,
                    icon: icon
                });
        }

        self.toObject = function getDialInformation() {
            return {
                url: self.url,
                title: self.title,
                icon: self.icon,
            };
        }

        self.launch = function launchHandler(e) {
            e.stopPropagation();
            e.preventDefault();

            var url = $(e.currentTarget).find('a').attr('href');

            if (window.analytics) {
                window.analytics.sendEvent({
                    category: 'Dials',
                    action: 'Click',
                    label: url
                }, function() {
                    window.location.href = url;
                });
            }

            setTimeout(function() {
                window.location.href = url;
            }, 500);
        };


        init();

        return self;
    };
});
