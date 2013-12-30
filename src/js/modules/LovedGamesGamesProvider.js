"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'AndroidDial'], function LovedGamesGamesProvider(env, $, when, JSONProviderFactory, Runtime, AndroidDial) {
    if (window.DEBUG && window.DEBUGlogLoadOrder) console.log("Loading Module : LovedGamesGamesProvider");
    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            settings = {
                maxDials: null,
                mutableList: false,
                pathToJSON: null,
                // wrapDial: Dial
            };

        if(window.DEBUG && window.DEBUG.exposeModules) window.LovedGamesGamesProvider = self;

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            settings.pathToJSON = runtimeData.JSONPrefix + '/games.json'

            var parentInitting = parent.init("LovedGamesGamesProvider", settings);
            parentInitting.then(initting.resolve).otherwise(initting.reject);
        };

        Runtime.promise.then(init)
        initting.promise.otherwise(env.errhandler);

        return self;
    })();
});
