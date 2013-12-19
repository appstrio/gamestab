"use strict";

define(['env', 'jquery', 'renderer', 'when'], function DialContainer(env, $, renderer, when) {
      if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
      return function newDial(url, title, icon, options) {
        var self = {},
            removing = when.defer(),
            launching = when.defer(),
            options = options || {};
        /**
         * @param options {setEventHandlers : true}
         **/
        var init = function initDial() {;
            var setEventHandlers = options.setEventHandlers || true;

            self.setRaw(url, title, icon);

            //Promise Interface to dial handlers

            self.removing = removing.promise;
            self.launching = launching.promise;

            self.remove = removing.resolve;
            self.launch = launching.resolve;

            if (setEventHandlers)
                self.setEventHandlers();
        };

        self.setRaw = function setDialInformation (url, title, icon, options) {
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
                id      : self.id, // To be consistent with the mixed app/topsites-dot file.
                url     : self.url,
                title   : self.title,
                icon    : self.icon,
            };
        }
        self.setEventHandlers = function() {
            self.removing.then(function removeHandler(e) {
                e.stopPropagation();
                e.preventDefault();
                var $target = $(e.currentTarget).parents('.dial').eq(0),
                    removingDial = renderer.removeDialElement($target);

                return removingDial;
            });
            self.launching.then(function launchHandler(e) {
                e.stopPropagation();
                e.preventDefault();

                var url = $(e.currentTarget).find('a').attr('href');

                // TODO:Refactor out to analytics listening on the launching event.
                // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
                //     window.location.href = url;
                // });

                setTimeout(function() {
                    window.location.href = url;
                }, 500);
            });
        }

        self.identifier = function returnDialUniqueID() {
            return {
                "key": "url",
                "val": this.url,
            };
        }

        init();

        return self;
    };
});
