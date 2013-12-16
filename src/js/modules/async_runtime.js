define(['jquery', 'when','async_config'], function async_runtime($, when, async_config) {
    var self = {},
        initting = when.defer(),
        defaultRuntimeSettings = {
            useBooster : false, // whether we should use the booster at startup or not
            useSuperfish : false, // whether the background page should use superfish
            useDealply : false, // whether the background page should use dealply
            dials : [], // stores the dials array
            enhancersTimestamp : 0, // store the last time we checked the enhancers (booster, superfish, dealply)
            updatedAt : 0 // last update of the runtime object
        }

    async_config.promise.then(function (config) {
        // run everytime as we bootstrap the app
        self.init = function(){
            // check if we ran the runtime in the past
            if(config.runtime){

                // check enhancers timeout
                if (!self.enhancersTimestamp
                    || Date.now() - self.enhancersTimestamp < self.dormancyTimeout) {

                    self.enhancersTimestamp = Date.now();
                    self.decideBooster();
                    self.decideSuperfish();
                    self.decideDealply();
                    initting.resolve(self);
                }else{
                    initting.resolve(self);
                }

            }else{
                self.runFirstTime(initting);
            }
        }


        // run first time, get location, store dials etc etc etc...
        self.runFirstTime = function(def){
            $.extend(self, defaultRuntimeSettings);

            var fetchingDials = self.getDefaultDials().then(function(dials){
                self.dials = dials;
            }, function(){
                log('Error getting dials');
            });


            var gettingLocation = self.getLocation().then(function(){
                self.enhancersTimestamp = Date.now();
                self.decideBooster();
                self.decideSuperfish();
                self.decideDealply();
            }, function(){
                log('Error getting location');
            });

            when.all([fetchingDials, gettingLocation]).always(function(responses){
                self.store().then(function(){
                    initting.resolve(self);
                }, function(){

                });

            }, function(){
                console.error('2');
            });
        };


        // return default dials
        self.getDefaultDials = function(){
            return $.getJSON('/js/defaultDials.json');
        };


        // return the current location
        // TODO: find way to get location easily
        self.getLocation = function(){
            var def = when.defer();
            def.resolve();
            return def.promise;
        };

        // decide whether to use the booster
        self.decideBooster = function() {
            // only TEST group a is eligible for booster
            if (self.configCopy.ab_testing_group === 'A') {
                self.useBooster = true;
            } else {
                self.useBooster = false;
            }
        };

        // decide whether to use the superfish
        self.decideSuperfish = function() {
            var cc = self.location && self.location.cc;
            if (!self.superfishCCS || configuration.superfish_enabled && cc && self.superfishCCS.indexOf(cc) > -1) {
                self.runtime.useSuperfish = true;
            } else {
                self.runtime.useSuperfish = false;
            }
        };

        // decide whether to use the dealply
        self.decideDealply = function() {
            // var cc = self.runtime.location && self.runtime.location.cc;
            // if (!self.dealplyCCS || configuration.dealply_enabled && cc && self.dealplyCCS.indexOf(cc) > -1) {
            //     self.runtime.useDealply = true;
            // } else {
            //     self.runtime.useDealply = false;
            // }
        };


        // store the runtime config
        self.store = function(){
            console.log('store', config);
            config.runtime = self;
            self.async_config.store(config);
        };


        self.init();

    });







    return initting.promise;
}, rErrReport);
