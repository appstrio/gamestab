"use strict";

define(['env', 'jquery', 'when', 'Provider', 'Runtime', 'Renderer', 'Dial'], function WebAppsProvider(env, $, when, BaseProvider, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : WebAppsProvider");
    return function newJSONProvider(options) {
        var initting = when.defer(),
            parent = BaseProvider(),
            self = Object.create(parent),
            defaultSettings = {
                preLoad: true,
                forceLoadFromJSON: false,
                // pathToJSON : '/js/data/predefinedDials.json',
            };

        /**
         * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
         */
        self.init = function initModule(runtimeData, options) { // Passed in from runtime
            //Create a settings object by overriding defaultSettings with any custom settings
            $.extend(self, {
                name: options.name, //required for getting and storing dial list
                promise: initting.promise,
                dials: [],
                settings: $.extend(defaultSettings, options),
            });

            //Fetch list of dials
            var listFetching = self.getDialList(self.name); // We don't care about what it returns... for now.
            //If no dials in localstorage, we need to fetch them and set them there.
            if (self.settings.forceLoadFromJSON || !self.dials || self.dials.length == 0) {
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(options.pathToJSON);
                fetchingJSON.then(function(dialArray) {
                    finish();

                    self.storeDialList(self.name, self.dials);

                }, initting.reject);
            } else {
                finish();
            };
            var finish = function completeInitialization() {
                if (self.settings.wrapDial) {
                    self.dials = _.map(dialArray, wrapDial);
                } else {
                    self.dials = dialArray;
                };

                initting.resolve(self.dials);
            };
        };

        if (self.settings.preLoad)
            self.init();

        initting.promise.otherwise(self.errorLoading);

        return self;
    };
}, rErrReport);
