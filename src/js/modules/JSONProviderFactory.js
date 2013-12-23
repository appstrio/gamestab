"use strict";

define(['env', 'jquery', 'when', 'Provider', 'Runtime', 'Renderer', 'Dial'], function JSONProviderFactory(env, $, when, BaseProvider, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : JSONProviderFactory");
    return function JSONProviderFactory(preLoad) {
        var initting = when.defer(),
            parent = BaseProvider(),
            self = Object.create(parent);
        self.settings = {
            preLoad: (typeof preLoad !== 'undefined') ? preLoad : false,
            forceLoadFromJSON: env.JSONProviderForceLoadFromJSON,
            mutableList: true,
            wrapDial: Dial,
        };

        /**
         * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
         */
        self.init = function initModule(name, options) {
            var listFetching;
            options = options || {};
            $.extend(self, {
                name: name, //required for getting and storing dial list
                promise: initting.promise,
                dials: [],
            });
            // Merge options with settings, thus overriding default settings with properties from options, but only if they exist
            $.extend(self.settings, options);

            // if we don't want the dial list to ever change:
            if (!self.settings.mutableList)
                this.removeDialFromList = null;

            //Fetch list of dials
            if (self.settings.forceLoadFromJSON)
                listFetching = when.reject();
            else
                listFetching = self.getDialList(self.name);

            listFetching.then(resolveAndSave)
                .otherwise(function NoDialsInLocalStorage() {
                    //If no dials in localstorage, we need to fetch them and set them there.
                    //Get them from a JSON file and put them in storage
                    var fetchingJSON = $.getJSON(options.pathToJSON);
                    fetchingJSON.then(resolveAndSave, initting.reject);
                });

            return initting.promise;
        };

        var resolveAndSave = function(dials) {
            if (dials) {
                self.storeDialList(self.name, self.dials);
                initting.resolve(self.dials);
            } else initting.reject("NoDials")
        }

        if (self.settings.preLoad)
            self.init();

        initting.promise.otherwise(env.errorhandler);

        return self;
    };
}, rErrReport);
