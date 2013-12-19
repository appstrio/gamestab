"use strict";

define(['env', 'jquery', 'Renderer', 'when'], function DialContainer(env, $, renderer, when) {
      if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
      return function newDial(dialObject, options) {
        var self = {},
            options = options || {};

        var init = function initDial() {;
                $.extend(self, dialObject);
        }

        self.toObject = function getDialInformation() {
            return {
                url   : self.url,
                title : self.title,
                icon  : self.icon,
                chromeId  : self.chromeId
            };
        }

        self.launch = function(){
            window.location = self.url;
        };


        init();

        return self;
    };
});
