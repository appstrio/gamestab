function Setup(done){
    var self = this;
    self.geo = new Geo();
    self.key = "setup";
    self.storage = new MyStorage();
    self.superfishCCS = ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'NZ','SE','CH','NO','NL','BE','AT','FL','IS','IE','LU','IE', 'ES', 'IT', 'BR','AR','IL'];

    self.storage.get(self.key, function(result){
        if(result[self.key]){
            self.setup = result[self.key];
            self.checkBoosterEnabled();
            if(!self.setup.location) {
                self.getLocation(function(location){
                    self.setup.location = location;
                    self.store();
                    done && done(null, self.setup);
                });
            }else{
                done && done(null, self.setup);
            }
        }else{
            self.run(done);
        }
    })
};


Setup.prototype.checkBoosterEnabled = function(){
    var self=this;
    var period = 1000 * 3600 * 5;
    if(CONF.config.booster_enabled && !self.setup.checkedBooster && Date.now() - self.setup.timestamp > period){
        self.setup.checkedBooster = Date.now();
        if(CONF.config.ab_testing_group === 'A'){
            CONF.config.with_booster = true;
            self.storeConfig();
        }
        self.store();
    }

}

Setup.prototype.run = function(done){
    var self = this;
    var setup = {};
    // get localization
    self.geo.get(function(err, location){
        if(!err && location){
            setup.location = location;
        }

        // check if eligble for superfish
        if(CONF.config.build_options.superfish_enabled){
            if(setup.location && setup.location.country && setup.location.country.short_name){
                if(self.superfishCCS.indexOf(setup.location.country.short_name) > -1){
                    CONF.config.superfish_enabled = true;
                }else{
                    CONF.config.superfish_enabled = false;
                }
            }
        }

        self.setup = setup;
        self.storeConfig();
        self.store();

        done && done(null, self.setup);
    });
};

Setup.prototype.store = function(done){
    if(!this.setup) return done && done();
    this.setup.timestamp = Date.now();
    var objToStore = {};
    objToStore[this.key] = this.setup;
    this.storage.set(objToStore, done);
};

Setup.prototype.storeConfig = function(){
   CONF.storeConfigObject();
};