"use strict";

define(['env', 'jquery', 'when', 'JSONProviderFactory', 'Runtime', 'Renderer', 'Dial'], function StoredDialsProvider(env, $, when, JSONProviderFactory, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : StoredDialsProvider");
    //TODO:
    return (function StoredDialsProvider() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            settings = {
                forceLoadFromJSON : true,
                maxDials          : null,
                pathToJSON        : null,
            };

        /**
         * Callback function for self.promise success
         */
        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });
            // Determine whether to load default-by-ccJSON or defaultJSON
            if(runtimeData.defaultDialsByCountry) {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaults_" + runtimeData.countryCode + ".json";
            } else {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaultDials.json";
            }

            var parentInitting = parent.init("StoredDialsProvider", settings);
            parentInitting.then(initting.resolve);
        };

        self.addDial = function addDial(dial) {
            var def = when.defer()
            if(self.dials.length >= settings.maxDials) {
                def.reject("No more room, delete something first!")
            } else {
                self.dials.push(dial)

                self.storeDialList(self.name, self.dials)

                def.resolve(dial)
            }
            return def.promise
        }

        self.removeDial = function removeDial(dial) {}

        Runtime.promise.then(function initCondition(runtimeData) {
            init(runtimeData);
        })

        initting.promise.otherwise(env.errhandler);

        return self;
    })();
}, rErrReport);
