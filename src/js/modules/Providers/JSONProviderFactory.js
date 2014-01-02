define(["env", "jquery", "when", "Provider", "Runtime", "Renderer", "Dial", "AndroidDial", "underscore"], function JSONProviderFactory(env, $, when, BaseProvider, runtime, renderer, Dial, AndroidDial, _) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : JSONProviderFactory");
    }

    return function JSONProviderFactory(preLoad) {
        var initting = when.defer(),
            parent = BaseProvider(),
            self = Object.create(parent);
        self.settings = {
            preLoad: (typeof preLoad !== 'undefined') ? preLoad : false,
            forceLoadFromJSON: false,
            mutableList: true,
            wrapDial: Dial,
        };
        self.promise = initting.promise;

        /**
         * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
         */
        self.init = function initModule(name, options) {
            var listFetching;
            options = options || {};
            $.extend(self, {
                name: name, //required for getting and storing dial list
                dials: [],
            });
            // Merge options with settings, thus overriding default settings with properties from options, but only if they exist
            $.extend(self.settings, options);

            // if we don't want the dial list to ever change:
            if (!self.settings.mutableList) {
                this.removeDialFromList = null;
            }

            //Fetch list of dials
            if (self.settings.forceLoadFromJSON) {
                listFetching = when.reject();
            } else {
                listFetching = self.getDialList(self.name);
            }

            listFetching.then(resolveAndSave)
                .otherwise(function NoDialsInLocalStorage() {
                    //If no dials in localstorage, we need to fetch them and set them there.
                    //Get them from a JSON file and put them in storage
                    var fetchingJSON = $.getJSON(options.pathToJSON);
                    fetchingJSON.done(resolveAndSave).fail(initting.reject);
                });

            return initting.promise;
        };

        var resolveAndSave = function(dials) {
            if (dials) {
                self.storeDialList(self.name, dials, true);
                self.dials = _.map(dials, function(dial) {
                    if (dial._type) {
                        if (dial._type === "Dial") {
                            return Dial(dial);
                        } else if (dial._type === "AndroidDial") {
                            return AndroidDial(dial);
                        }
                    } else {
                        return self.settings.wrapDial(dial);
                    }
                });
                initting.resolve(self.dials);
            } else {
                initting.reject("NoDials");
            }
        };

        if (self.settings.preLoad)
            self.init();

        initting.promise.otherwise(env.errorhandler);

        return self;
    };
});
