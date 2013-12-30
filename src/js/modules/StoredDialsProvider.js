define(["env", "jquery", "when", "JSONProviderFactory", "Runtime", "Renderer", "Dial", "LovedGamesGamesProvider", "AndroidAppsListProvider", "underscore", "Storage"], function StoredDialsProvider(env, $, when, JSONProviderFactory, Runtime, renderer, Dial, LovedGamesGamesProvider, AndroidAppsListProvider, _, storage) {
    "use strict";

    if (window.DEBUG && window.DEBUG.logLoadOrder) {
        console.log("Loading Module : StoredDialsProvider");
    }
    return (function StoredDialsProvider() {
        var initting = when.defer(),
            parent = JSONProviderFactory(),
            self = Object.create(parent),
            name = "StoredDialsProvider",
            settings = {
                maxDials: null,
                pathToJSON: null,
            };

        if (window.DEBUG && window.DEBUG.exposeModules) {
            window.StoredDialsProvider = self;
        }

        var init = function initModule(runtimeData) {
            $.extend(self, {
                promise: initting.promise,
            });

            settings.maxDials = runtimeData.maxDials;
            settings.defaultDialPatternID = runtimeData.dialPatternID || "def";



            // Determine whether to load default-by-ccJSON or defaultJSON
            if (runtimeData.defaultDialsByCountryEnabled) {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaults" + runtimeData.countryCode.toUpperCase() + ".json";
            } else {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaultDials.json";
            }

            var parentInitting = parent.init(name, settings);

            var isntFirstRunTime = null //storage.get(name);
            if (!isntFirstRunTime) {
                parentInitting.then(loadDialPattern).then(initting.resolve).otherwise(initting.reject);
            } else {
                parentInitting.then(initting.resolve).otherwise(initting.reject);
            }
        };
        var loadDialPattern = function() {
            var loadDials, dialPatternID = settings.defaultDialPatternID;
            if (dialPatternID === "def") {
                loadDials = when.join(
                    AndroidAppsListProvider.promise,
                    LovedGamesGamesProvider.promise
                ).then(function specifyPattern(dialsArray) {
                    var AndroidAppsDials = dialsArray[0],
                        LovedGamesGamesDials = dialsArray[1];
                    return storeDialRowPattern([{
                        dials: self.dials,
                    }, {
                        dials: LovedGamesGamesDials,
                        shuffle: true,
                    }, {
                        dials: AndroidAppsDials,
                        shuffle: true,
                    }], {
                        maxDials: settings.maxDials
                    });
                });
            } else {
                throw "Not implemented";
            }
            return loadDials;
        };
        var storeDialRowPattern = function(rows, options) {
            var maxDials = options.maxDials || 18,
                rowsCount = rows.length,
                dialsPerRow = maxDials / rowsCount;

            self.dials = [];

            _.each(rows, function aggregateDials(row) {
                var dials = row.dials.slice(0, dialsPerRow);

                if (row.shuffle) {
                    self.dials = self.dials.concat(shuffleArray(dials));
                } else {
                    self.dials = self.dials.concat(dials);
                }
            });

            self.storeDialList(self.name, self.dials);
            // self.dials = _.map(self.dials, function(dial) {
            //     return self.settings.wrapDial(dial);
            // });

            return when.resolve(self.dials);
        };

        self.addDial = function addDial(dial) {
            var def = when.defer();
            if (self.dials.length >= settings.maxDials) {
                def.reject("No more room, delete something first!");
            } else {
                self.dials.push(dial);

                self.storeDialList(self.name, self.dials);

                def.resolve(dial);
            }
            return def.promise;
        };
        //SRC: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
        //+ Jonas Raoni Soares Silva
        //@ http://jsfromhell.com/array/shuffle [v1.0]
        var shuffleArray = function shuffle(o) { //v1.0
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };

        // self.removeDial = function removeDial(dial) {};

        Runtime.promise.then(init);
        initting.promise.otherwise(env.errhandler);

        return self;
    })();
});
