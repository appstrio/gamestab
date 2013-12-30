"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'Renderer', 'Dial'], function WebAppsListProvider(env, $, when, JSONProviderFactory, Runtime, renderer, Dial) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : WebAppsListProvider");
    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            settings = {
                maxDials: null,
                mutableList: false,
                pathToJSON: null,
            };

        if(window.DEBUG && window.DEBUG.exposeModules) window.WebAppsListProvider = self;

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            settings.pathToJSON = runtimeData.JSONPrefix + '/bestsites.json'

            var parentInitting = parent.init("WebAppsListProvider", settings);
            parentInitting.then(initting.resolve).otherwise(initting.reject);
        };

        Runtime.promise.then(init)
        initting.promise.otherwise(env.errhandler);

        return self;
    })(JSONProviderFactory);
});
