"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'Renderer', 'Dial'], function WebAppsProvider(env, $, when, JSONProviderFactory, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : WebAppsProvider");
    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory({
                preLoad: false,
                mutableList: false,
                pathToJSON: '/js/data/webapps.json'
            }),
            self = Object.create(parent),
            options = options || {};

        self.settings = {
            preLoad           : options.preLoad           || true,
            forceLoadFromJSON : options.forceLoadFromJSON || false,
        };

        var init = function initModule(runtimeData, options) {
            $.extend(self,{
                name     : "WebAppsListProvider", //required for getting and storing dial list
                promise  : initting.promise,
            });

            var parentInitting = parent.init();
            parentInitting.then(initting.resolve);
        };

        if (self.settings.preLoad)
            init();

        initting.promise.otherwise(env.errhandler);

        return self;
    })(JSONProviderFactory);
}, rErrReport);
