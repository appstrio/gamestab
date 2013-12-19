"use strict";

define(['env', 'jquery', 'when', 'Provider', 'Runtime', 'Renderer', 'Dial'], function DialsFromJSONProvider(env, $, when, BaseProvider, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialsFromJSONProvider");
    return function newJSONProvider(options) {
        var initting = when.defer(),
            parent = BaseProvider(),
            self = Object.create(parent),
            options = options || {};

        self.settings = {
            preLoad: options.preLoad || true,
            forceLoadFromJSON: options.forceLoadFromJSON || false,
            mutableList: options.mutableList || true,
        };

        /**
         * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
         */
        self.init = function initModule() {
            //Create a settings object by overriding defaultSettings with any custom settings
            $.extend(self, {
                name: options.name, //required for getting and storing dial list
                promise: initting.promise,
                dials: [],
            });

            // if we don't want the dial list to ever change:
            if (!self.settings.mutableList)
                this.removeDialFromList = null;

            //Fetch list of dials
            var listFetching = self.getDialList(this.name); // We don't care about what it returns... for now.
            //If no dials in localstorage, we need to fetch them and set them there.
            if (self.settings.forceLoadFromJSON || !self.dials || self.dials.length == 0) {
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(options.pathToJSON);
                fetchingJSON.then(function(dialArray) {
                    if (self.settings.wrapDial) {
                        self.dials = _.map(dialArray, wrapDial);
                    } else {
                        self.dials = dialArray;
                    };

                    initting.resolve(self.dials);

                    self.storeDialList(this.name, this.dials);
                }, initting.reject);
            } else {
                initting.resolve(self.dials);
            };
            return initting.promise;
        };כ

        if (self.settings.preLoad)
            self.init();

        initting.promise.otherwise(env.errorhandler);

        return self;
    };
}, rErrReport);
