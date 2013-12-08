function Runtime(done) {
    var self = this;
    self.geo = new Geo();
    self.key = "runtime";
    self.storage = new MyStorage();
    self.dormancyTimeout = 6000 * 10;
    self.superfishCCS = CONF.config.superfishSupportedCCS;
    self.dealplyCCS = CONF.config.dealplySupportedCCS;

    self.runtime = CONF.config.runtime || {
        useSuperfish: false,
        useDealply: false,
        useBooster: false,
        enhancersTimestamp: 0
    };

    // get runtime object from the localstorage or create one by running self.runFirstTime
    if (!self.runtime.enhancersTimestamp || Date.now() - self.runtime.enhancersTimestamp < self.dormancyTimeout) {
        done && done(null);
    } else {
        self.executeEnhancers(done);
    }

};


// decide whether to use the booster
Runtime.prototype.decideBooster = function () {
    var self = this;
    // only TEST group a is eligible for booster
    if (CONF.config.ab_testing_group === 'A') {
        CONF.config.runtime.useBooster = true;
    } else {
        CONF.config.runtime.useBooster = false;
    }
};

// decide whether to use the superfish
Runtime.prototype.decideSuperfish = function () {
    var self = this;
    var cc = self.runtime.location && self.runtime.location.cc;
    if (!self.superifshCCS || CONF.config.superfish_enabled && cc && self.superifshCCS.indexOf(cc) > -1) {
        self.runtime.useSuperfish = true;
    } else {
        self.runtime.useSuperfish = false;
    }
};

// decide whether to use the dealply
Runtime.prototype.decideDealply = function () {
    var self = this;
    var cc = self.runtime.location && self.runtime.location.cc;
    if (!self.dealplyCCS || CONF.config.dealply_enabled && cc && self.dealplyCCS.indexOf(cc) > -1) {
        self.runtime.useDealply = true;
    } else {
        self.runtime.useDealply = false;
    }
};


// execute runtime enhancers
Runtime.prototype.executeEnhancers = function (done) {
    var self = this;

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
        done && done(null);
    });
};

Runtime.prototype.store = function (done) {
    CONF.config.runtime = this.runtime;
    CONF.storeConfigObject();
};