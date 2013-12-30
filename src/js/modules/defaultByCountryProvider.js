define(["env", "jquery", "when", "JSONProviderFactory", "Runtime"], function defaultByCountryProvider(env, $, when, JSONProviderFactory, Runtime) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : defaultByCountryProvider");
    }

    return (function() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            settings = {
                maxDials: null,
                mutableList: false,
                pathToJSON: null,
            };

        if(DEBUG && DEBUG.exposeModules) {
            window.defaultByCountryProvider = self;
        }

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            var defaultDialsByCountryJSONPath = runtimeData.JSONPrefix + "/defaults" + runtimeData.countryCode.toUpperCase() + ".json";

            // settings.pathToJSON = runtimeData.JSONPrefix + "/bestsites.json";
            settings.pathToJSON = defaultDialsByCountryJSONPath;

            var parentInitting = parent.init("defaultByCountryProvider", settings);
            parentInitting.then(initting.resolve).otherwise(initting.reject);
        };

        Runtime.promise.then(init);

        return self;
    })(JSONProviderFactory);
});
