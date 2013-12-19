"use strict";



define(['env', 'jquery', 'when', 'Provider', 'Runtime', 'Renderer', 'Dial'], function WebAppsProvider(env, $, when, baseprovider, runtime, renderer, Dial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : WebAppsProvider");
    return (function() {
        var initting = when.defer(),
            parent = baseprovider(),
            self = Object.create(parent),
            defaultSettings = {
                pathToJSON : '/js/predefinedDials.json',
            };

        /**
         * Callback function for self.promise success
         * @param options Custom settings to override self.settings
         */
        var init = function initModule(runtimeData, options) { // Passed in from runtime
            //Create a settings object by overriding defaultSettings with any custom settings
            $.extend(self,{
                name     : "WebAppsProvider", //required for getting and storing dial list
                promise  : initting.promise,
                dials: [],
                settings : $.extend(defaultSettings, options),
            });

            //Fetch list of dials
            var listFetching = self.getDialList(self.name); // We don't care about what it returns... for now.
            //If no dials in localstorage, we need to fetch them and set them there.
            if (!self.dials || self.dials.length == 0) {
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(self.settings.pathToJSON);
                fetchingJSON.then(function(dialArray) {
                    self.dials = prepareDials(dialArray);

                    self.setDialList(self.name, self.dials);

                    initting.resolve(self.dials);

                }, initting.reject);
            } else {
                //TODO : mechanism to force reload the JSON;

                self.dials = prepareDials(listFetching);

                initting.resolve(self.dials);
            }

        };

        var prepareDials = function prepaireDials(dialarray) {
            return _.map(dialarray, function(dial) {
                var dial = Dial(dial);

                self.setEventHandlers(dial);

                return dial;
            });
        };

        // Main provider.js

        self.fetch = function fetchDials () {
            return when.resolve(self.dials);
        }

        self.setEventHandlers = function (dial) {
            dial.removing.then(function removeHandler() {
                self.removeDialFromList(dial);
            });
        }

        // Template:
        // self.removeDialFromList = function removeDialFromList (e) {
        //     var parentHandling = parent.removeDialFromList(e),
        //         // removing = when.defer();

        //     return parentHandling;
        // }

        //Init after dependencies have loaded;
        init();

        //If init fails handlers
        initting.promise.catch(self.errorLoading);

        return self;
    })(baseprovider);
}, rErrReport);
