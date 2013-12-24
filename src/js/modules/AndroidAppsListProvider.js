"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'AndroidDial'], function AndroidAppsListProvider(env, $, when, JSONProviderFactory, AndroidDial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : AndroidAppsListProvider");
    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory({
                name        : "AndroidAppsListProvider",
                preLoad     : false,
                mutableList : false,
                pathToJSON  : '/js/data/android-editors_choice.json',
                wrapDial    : AndroidDial,
                forceLoadFromJSON    : true,
            }),
            self = Object.create(parent),
            options = options || {};

        self.settings = {
            preLoad           : options.preLoad           || true
        };

        var init = function initModule(options) {
            $.extend(self,{
                promise  : initting.promise,
            });

            var parentInitting = parent.init();
            parentInitting.then(initting.resolve);
        };

        if (self.settings.preLoad)
            init();

        initting.promise.otherwise(env.errhandler);

        return self;
    })();
}, rErrReport);
