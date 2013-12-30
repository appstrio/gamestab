"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'AndroidDial'], function AndroidAppsListProvider(env, $, when, JSONProviderFactory, Runtime, AndroidDial) {
    if (window.DEBUG && window.DEBUGlogLoadOrder) console.log("Loading Module : AndroidAppsListProvider");
    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            settings = {
                maxDials: null,
                mutableList: false,
                pathToJSON: null,
                wrapDial: AndroidDial
            };

        if(window.DEBUG && window.DEBUG.exposeModules) window.AndroidAppsListProvider = self;

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            settings.pathToJSON = runtimeData.JSONPrefix + '/android_free_games.json';

            var parentInitting = parent.init("AndroidAppsListProvider", settings);
            parentInitting.then(initting.resolve).otherwise(initting.reject);
        };

        Runtime.promise.then(init);


        return self;
    })();
});
