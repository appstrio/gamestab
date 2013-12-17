define(function async_runtime(require) {
    var self = {
        runtime: {},
        configModule: {},
        config: {},
    },
        $ = require('jquery'),
        when = require('when'),
        gettingConfig = require('async_config'),
        // config = null,
        initting = when.defer(),
        defaultRuntimeSettings = {
            useBooster: false, // whether we should use the booster at startup or not
            useSuperfish: false, // whether the background page should use superfish
            useDealply: false, // whether the background page should use dealply
            dials: [], // stores the dials array
            enhancersTimestamp: 0, // store the last time we checked the enhancers (booster, superfish, dealply)
            updatedAt: 0 // last update of the runtime object
        }

        // return default dials
    var getDefaultDials = function() {
        return $.getJSON('/js/defaultDials.json');
    };

    // return the current location
    // TODO: find way to get location easily
    var getLocation = function() {
        var def = when.defer();
        def.resolve();
        return def.promise;
    };

    // decide whether to use the booster
    var decideBooster = function() {
        // only TEST group a is eligible for booster
        if (self.config.ab_testing_group === 'A') {
            self.runtime.useBooster = true;
        } else {
            self.runtime.useBooster = false;
        }
    };

    // decide whether to use the superfish
    var decideSuperfish = function() {
        var cc = self.location && self.location.cc;
        if (!self.runtime.superfishCCS || self.runtime.superfish_enabled && cc && self.runtime.superfishCCS.indexOf(cc) > -1) {
            self.runtime.useSuperfish = true;
        } else {
            self.runtime.useSuperfish = false;
        }
    };

    // decide whether to use the dealply
    var decideDealply = function() {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.runtime.dealplyCCS || self.runtime.dealply_enabled && cc && self.runtime.dealplyCCS.indexOf(cc) > -1) {
            self.runtime.useDealply = true;
        } else {
            self.runtime.useDealply = false;
        }
    };

    // store the runtime config
    var storeRuntime = function() {
        self.configModule.config.runtime = self.runtime;
        self.configModule.storeConfig();
    };

    // run first time, get location, store dials etc etc etc...
    var runFirstTime = function(def) {
        self.runtime = {};
        $.extend(self.runtime, defaultRuntimeSettings);

        var fetchingDials = getDefaultDials();
        fetchingDials.then(function(dials) {
            self.dials = dials;
        }, def.reject);

        var gettingLocation = getLocation();
        gettingLocation.then(function() {
            self.runtime.enhancersTimestamp = Date.now();
            decideBooster();
            decideSuperfish();
            decideDealply();
        }, def.reject);

        var finished = when.all([fetchingDials, gettingLocation])
        finished.then(function() {
            if (DEBUG) log("Loaded default dials and location");
            def.resolve(self);
        }).always(function(argument) {
            if (DEBUG) log("Finished runtime loading, not sure about dials and location though;")
        });
    };

    gettingConfig.then(function(_configModule) {
        self.configModule = _configModule;
        self.config = _configModule.config;
        self.runtime = self.config.runtime;
        console.log('config.runtime', self.runtime);

        // run everytime as we bootstrap the app
        var init = function() {
            // check if we ran the runtime in the past
            if (self.runtime) {

                // check enhancers timeout
                if (!self.runtime.enhancersTimestamp || Date.now() - self.runtime.enhancersTimestamp < self.config.dormancyTimeout) {

                    self.runtime.enhancersTimestamp = Date.now();
                    decideBooster();
                    decideSuperfish();
                    decideDealply();
                }
                initting.resolve(self);
            } else {
                runFirstTime(initting);
            }
        }

        init();
    });

    initting.promise.then(storeRuntime);
    return initting.promise;
}, rErrReport);
