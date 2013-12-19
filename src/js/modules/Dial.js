"use strict";

define(['env', 'jquery', 'Renderer', 'when'], function DialContainer(env, $, renderer, when) {
      if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
      return function newDial(url, title, icon, options) {
        var self = {},
            options = options || {};

        var init = function initDial() {;
            // check if passing object as first argument
            if (url && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    id      : '', // To be consistent with the mixed app/topsites-dot file.
                    url     : url,
                    title   : title,
                    icon    : icon,
                });
        }

        self.getRaw = function getDialInformation() {
            return {
                id    : self.id, // To be consistent with the mixed app/topsites-dot file.
                url   : self.url,
                title : self.title,
                icon  : self.icon,
            };
        }

        self.identifier = function returnDialUniqueID() {
            return {
                "key": "id",
                "val": this.id,
            };
        }

        init();

        return self;
    };
});
