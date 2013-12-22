"use strict";

define(['env', 'jquery', 'when', 'Provider', 'Runtime', 'Renderer', 'Dial'], function JSONProviderFactory(env, $, when, BaseProvider, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : JSONProviderFactory");
    return function JSONProviderFactory(options) {
        var initting = when.defer(),
            parent = BaseProvider(),
            self = Object.create(parent),
            options = options || {};

        self.settings = {
            preLoad: typeof options.preLoad !== 'undefined' ? options.preLoad : true,
            forceLoadFromJSON: typeof options.forceLoadFromJSON !== 'undefined' ? options.forceLoadFromJSON : false,
            mutableList: typeof options.mutableList !== 'undefined' ? options.mutableList : true,
            wrapDial: typeof options.wrapDial !== 'undefined' ? options.wrapDial : Dial,
        };

        /**
         * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
         */
        self.init = function initModule() {
            var listFetching;
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
            if (self.settings.forceLoadFromJSON)
                listFetching = when.reject();
            else
                listFetching = self.getDialList(self.name);

            listFetching.then(self.resolveAndSave)
                .otherwise(function NoDialsInLocalStorage() {
                    //If no dials in localstorage, we need to fetch them and set them there.
                    //Get them from a JSON file and put them in storage
                    var fetchingJSON = $.getJSON(options.pathToJSON);
                    fetchingJSON.then(self.resolveAndSave, initting.reject);
                });

            return initting.promise;
        };

        self.resolveAndSave = function(dials) {
            if (self.settings.wrapDial) {
                self.dials = _.map(dials, function (dial) {
                    // HERE IS PROBLEM
                    return self.settings.wrapDial(dial);
                });
            } else {
                self.dials = dials;
            };
            if (self.dials)
                self.storeDialList(self.name, self.dials);

            initting.resolve(self.dials);
        }

        if (self.settings.preLoad)
            self.init();

        initting.promise.otherwise(env.errorhandler);

        return self;
    };
}, rErrReport);
