define(['async_config'], function async_runtime(config) {
    var self = {},
deferred = new $.Deferred();
    self.geo = new Geo();
    self.key = "runtime";
    self.storage = new MyStorage();
    self.dormancyTimeout = 6000 * 10;
    self.superfishCCS = config.config.superfishSupportedCCS;
    self.dealplyCCS = config.config.dealplySupportedCCS;

    self.runtime = config.config.runtime || {
        useSuperfish: false,
        useDealply: false,
        useBooster: false,
        enhancersTimestamp: 0
    };

    self.init = function (done) {
        // get runtime object from the localstorage or create one by running self.runFirstTime
        if (!self.runtime.enhancersTimestamp || Date.now() - self.runtime.enhancersTimestamp < self.dormancyTimeout) {
            deferred.resolve(self);
        } else {
            self.executeEnhancers(done);
        }
    }

    // decide whether to use the booster
    self.decideBooster = function () {
        // only TEST group a is eligible for booster
        if (config.config.ab_testing_group === 'A') {
            config.config.runtime.useBooster = true;
        } else {
            config.config.runtime.useBooster = false;
        }
    };

    // decide whether to use the superfish
    self.decideSuperfish = function () {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.superifshCCS || config.config.superfish_enabled && cc && self.superifshCCS.indexOf(cc) > -1) {
            self.runtime.useSuperfish = true;
        } else {
            self.runtime.useSuperfish = false;
        }
    };

    // decide whether to use the dealply
    self.decideDealply = function () {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.dealplyCCS || config.config.dealply_enabled && cc && self.dealplyCCS.indexOf(cc) > -1) {
            self.runtime.useDealply = true;
        } else {
            self.runtime.useDealply = false;
        }
    };


    // execute runtime enhancers
    self.executeEnhancers = function (done) {


        self.runtime.enhancersTimestamp = Date.now();

        // get the user geo-location
        self.geo.get(function (err, location) {
            // we can still run without location
            if (!err && location) {
                self.runtime.location = location;
                self.runtime.location.cc = location.country && location.country.short_name;
            }

            self.decideBooster();
            self.decideSuperfish();
            self.decideDealply();

            self.store();
            deferred.resolve(self);
        });
    };

    self.store = function (done) {
        config.config.runtime = this.runtime;
        config.storeConfigObject();
    };

    return deferred.promise();
});