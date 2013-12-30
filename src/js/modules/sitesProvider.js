define(["env", "jquery", "when", "JSONProviderFactory", "Runtime"], function sitesProvider(env, $, when, JSONProviderFactory, Runtime) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : sitesProvider");
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
            window.sitesProvider = self;
        }

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            settings.pathToJSON = runtimeData.JSONPrefix + "/bestsites.json";

            var parentInitting = parent.init("sitesProvider", settings);
            parentInitting.then(initting.resolve).otherwise(initting.reject);
        };

        Runtime.promise.then(init);

        return self;
    })(JSONProviderFactory);
});
