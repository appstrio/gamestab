"use strict";

define(['env', 'jquery', 'Renderer', 'when', 'AndroIt'], function DialContainer(env, $, renderer, when, AndroIt) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialContainer");
    return function newDial(appID, title, icon, options) {
        var self = {},
            options = options || {},
            dialArgs = arguments;

        var init = function initDial() {;
            if (dialArgs[0] && !dialArgs[1] && !dialArgs[2]) {
                $.extend(self, dialArgs[0]);
            } else {
                $.extend(self, {
                    appID: appID,
                    title: title,
                    icon: icon,
                });
            }
        }

        self.toObject = function getDialInformation() {
            return {
                appID: appID,
                title: title,
                icon: icon,
            };
        }

        self.launch = function launchHandler(e) {
            e.stopPropagation();
            e.preventDefault();

            var def = when.defer(),
                confirming = when.defer(),
                userConfirmedInstallation = confirm("Are you sure you want to install " + self.title + "?");

            if(userConfirmedInstallation) confirming.resolve(); else confirming.reject()

            confirming.promise.then(function installSpecificApp() {
                AndroIt.install(self.appID)
                def.resolve()
            }).otherwise(def.reject)

            return def.promise
        };

        init();

        return self;
    };
});
