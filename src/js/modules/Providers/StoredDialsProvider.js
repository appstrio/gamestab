define(function StoredDialsProvider(require) {
    "use strict";

    var JSONProviderFactory = require("JSONProviderFactory"),
        $ = require("jquery"),
        when = require("when"),
        Runtime = require("Runtime"),
        _ = require("underscore"),
        storage = require("Storage"),
        Utils = require("Utils");

    if (DEBUG && DEBUG.logLoadOrder) {
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
            },
            patterns = {
                DEFAULT: 1000,
                DEFAULT_WITH_ANDROID: 1001,
            };
        self.promise = initting.promise;

        if (DEBUG && DEBUG.exposeModules) {
            window.StoredDialsProvider = self;
        }

        var init = function initModule(argsArray) {
            var runtimeData = argsArray[0],
                loadingPromises = [];

            settings.maxDials = runtimeData.maxDials;

            // Determine whether to load default-by-ccJSON or defaultJSON
            if (runtimeData.defaultDialsByCountryEnabled) {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaults" + runtimeData.countryCode.toUpperCase() + ".json";
            } else {
                settings.pathToJSON = runtimeData.JSONPrefix + "/defaultDials.json";
            }

            var parentInitting = parent.init(name, settings);
            loadingPromises.push(parentInitting);

            var firstRun = !storage.get(name);
            if (firstRun) {
                var run = when.defer();
                loadingPromises.push(run.promise);
                // TODO: rewrite or not?
                when.join(
                    parentInitting,
                    when(patterns.DEFAULT)
                ).spread(loadDialPattern)
                    .done(run.resolve, run.reject);
            }
            when.all(loadingPromises).done(initting.resolve, initting.reject);
        };
        var decideDialPattern = function decideDialPattern(runtimeData) {
            var dialPatternDecision = when.defer();
            if (window.isChromeApp && runtimeData.AndroItEnabled) {
                Utils.require("AndroIt").then(function (AndroIt) {
                    AndroIt.promise.done(
                        function() {
                            dialPatternDecision.resolve(patterns.DEFAULT);
                        }, function() {
                            dialPatternDecision.resolve(patterns.DEFAULT_NO_ANDROID);
                        });
                });
            } else {
                dialPatternDecision.resolve(patterns.DEFAULT_NO_ANDROID);
            }
            return dialPatternDecision.promise;
        };
        var loadDialPattern = function loadDialPattern(dials, _dialPatternID) {
            var loadDials = when.defer(), dialPatternID = _dialPatternID;
            if (dialPatternID === patterns.DEFAULT) {
                Utils.require("LovedGamesGamesProvider").then(function postRequire(LovedGamesGamesProvider) {
                    when.join(
                        LovedGamesGamesProvider.promise
                    ).then(function specifyPattern(argsArray) {
                        var LovedGamesGamesDials = argsArray[0],
                            dials1 = dials.slice(0, dials.length / 2),
                            dials2 = dials.slice(dials.length / 2, dials.length);

                        return storeDialRowPattern([{
                            dials: dials1,
                        }, {
                            dials: dials2,
                        }, {
                            dials: LovedGamesGamesDials,
                            shuffle: true,
                        }], {
                            maxDials: settings.maxDials
                        });
                    }).done(loadDials.resolve,loadDials.reject);
                });
            } else if (dialPatternID === patterns.DEFAULT_WITH_ANDROID) {
                Utils.require("LovedGamesGamesProvider", "AndroidAppsListProvider").then(function postRequire(LovedGamesGamesProvider, AndroidAppsListProvider) {
                    when.join(
                        AndroidAppsListProvider.promise,
                        LovedGamesGamesProvider.promise
                    ).then(function specifyPattern(dialsArray) {
                        var AndroidAppsDials = dialsArray[0],
                            LovedGamesGamesDials = dialsArray[1];
                        return storeDialRowPattern([{
                            dials: dials,
                        }, {
                            dials: LovedGamesGamesDials,
                            shuffle: true,
                        }, {
                            dials: AndroidAppsDials,
                            shuffle: true,
                        }], {
                            maxDials: settings.maxDials
                        });
                    }).done(loadDials.resolve,loadDials.reject);
                });
            } else {
                loadDials.reject("Not implemented");
            }
            return loadDials.promise;
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

            return true;
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

        when.all([
            Runtime.promise
        ]).done(init, initting.reject);

        return self;
    })();
});
