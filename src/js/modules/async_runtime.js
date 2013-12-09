define(['promise!async_config', 'jquery', 'geo', 'storage'], function async_runtime(config, $, geo, storage) {
    var self = {}, deferred = new $.Deferred();
    self.geo = geo;
    self.key = "runtime";
    self.storage = storage;
    self.dormancyTimeout = 6000 * 10;
    self.superfishCCS = config.config.superfishSupportedCCS;
    self.dealplyCCS = config.config.dealplySupportedCCS;

    self.runtime = config.config.runtime || {
        useSuperfish: false,
        useDealply: false,
        useBooster: false,
        enhancersTimestamp: 0
    };

    // decide whether to use the booster
    self.decideBooster = function() {
        // only TEST group a is eligible for booster
        if (config.config.ab_testing_group === 'A') {
            config.config.runtime.useBooster = true;
        } else {
            config.config.runtime.useBooster = false;
        }
    };

    // decide whether to use the superfish
    self.decideSuperfish = function() {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.superifshCCS || config.config.superfish_enabled && cc && self.superifshCCS.indexOf(cc) > -1) {
            self.runtime.useSuperfish = true;
        } else {
            self.runtime.useSuperfish = false;
        }
    };

    // decide whether to use the dealply
    self.decideDealply = function() {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.dealplyCCS || config.config.dealply_enabled && cc && self.dealplyCCS.indexOf(cc) > -1) {
            self.runtime.useDealply = true;
        } else {
            self.runtime.useDealply = false;
        }
    };


    // execute runtime enhancers
    self.executeEnhancers = function() {
        self.runtime.enhancersTimestamp = Date.now();
        // get the user geo-location
        self.geo.get(function(err, location) {
            // we can still run without location
            if (!err && location) {
                self.runtime.location = location;
                self.runtime.location.cc = location.country && location.country.short_name;
            } else {
                self.runtime.location = '';
                self.runtime.location.cc = '';
            }
            config.config.runtime = self.runtime;

            self.decideBooster();
            self.decideSuperfish();
            self.decideDealply();

            config.storeConfigObject();
            deferred.resolve(self);
        });
    };

    self.init = (function(done) {
        // get runtime object from the localstorage or create one by running self.runFirstTime
        if (!self.runtime.enhancersTimestamp || Date.now() - self.runtime.enhancersTimestamp < self.dormancyTimeout) {
            self.executeEnhancers();
        } else {
            deferred.resolve(self);
        }
    })();

    return deferred.promise();
});
