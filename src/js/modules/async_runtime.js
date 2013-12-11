define(['promise!async_config', 'jquery', 'locator'], function async_runtime(config, $, locator) {
    console.log('run');
    var self = {}, deferred = new $.Deferred(), configuration = config.config;
    self.key = "runtime";
    self.dormancyTimeout = 6000 * 10;
    self.superfishCCS = configuration.superfishSupportedCCS;
    self.dealplyCCS = configuration.dealplySupportedCCS;

    self.runtime = configuration.runtime || {
        useSuperfish: false,
        useDealply: false,
        useBooster: false,
        enhancersTimestamp: 0
    };

    // decide whether to use the booster
    self.decideBooster = function() {
        // only TEST group a is eligible for booster
        if (configuration.ab_testing_group === 'A') {
            configuration.runtime.useBooster = true;
        } else {
            configuration.runtime.useBooster = false;
        }
    };

    // decide whether to use the superfish
    self.decideSuperfish = function() {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.superfishCCS || configuration.superfish_enabled && cc && self.superfishCCS.indexOf(cc) > -1) {
            self.runtime.useSuperfish = true;
        } else {
            self.runtime.useSuperfish = false;
        }
    };

    // decide whether to use the dealply
    self.decideDealply = function() {
        var cc = self.runtime.location && self.runtime.location.cc;
        if (!self.dealplyCCS || configuration.dealply_enabled && cc && self.dealplyCCS.indexOf(cc) > -1) {
            self.runtime.useDealply = true;
        } else {
            self.runtime.useDealply = false;
        }
    };

    // execute runtime enhancers
self.executeEnhancers = function() {
        // self.runtime.enhancersTimestamp = Date.now();
        // we can still run without location
        // if (typeof locator.getLocation === 'undefined')
        // {
            self.runtime.location = {};
            self.runtime.location.cc = '';
            self.runtime.location.country = {short_name : ''};
            // self.runtime.location.country.short_name = '';
            deferred.resolve(self);
        // } else
        // locator.getLocation(function (glocation) {
        //     if (glocation) {
        //         self.runtime.location = location;
        //         self.runtime.location.cc = location.country && location.country.short_name;
        //     } else {
        //         self.runtime.location = '';
        //         self.runtime.location.cc = '';
        //     }
        //     configuration.runtime = self.runtime;

        //     self.decideBooster();
        //     self.decideSuperfish();
        //     self.decideDealply();

        //     config.storeConfigObject();
        //     console.log('runtime finished');
        //     deferred.resolve(self);
        // });
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
