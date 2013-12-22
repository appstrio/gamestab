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
            maxDials          : options.maxDials          || undefined,
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

        self.addDial = function addDial(dial) {
            var def = when.defer()
            if(self.dials.length >= self.settings.maxDials) {
                def.reject("No more room, delete something first!")
            } else {
                self.dials.push(dial)

                self.storeDialList(self.name, self.dials)

                def.resolve(dial)
            }
            return def.promise
        }

        self.removeDial = function removeDial(dial) {

        }

        if (self.settings.preLoad)
            init();

        initting.promise.otherwise(env.errhandler);

        return self;
    })();
}, rErrReport);
