"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'Renderer', 'Dial'], function StoredDialsProvider(env, $, when, JSONProviderFactory, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : StoredDialsProvider");
    //TODO:
    return (function StoredDialsProvider(options) {
        var initting = when.defer(),
            parent = JSONProviderFactory({
                name: "StoredDialsProvider",
                preLoad: false,
                // forceLoadFromJSON : true, // DEBUG
                pathToJSON: '/js/data/defaultDials.json',
            }),
            self = Object.create(parent),
            options = options || {};

        self.settings = {
            preLoad           : options.preLoad           || true,
            forceLoadFromJSON : options.forceLoadFromJSON || false,
        };

        /**
         * Callback function for self.promise success
         * @param options Custom settings to override self.settings
         */
        var init = function initModule() {
            $.extend(self, {
                name: "StoredDialsProvider", //required for getting and storing dial list
                promise: initting.promise,
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
