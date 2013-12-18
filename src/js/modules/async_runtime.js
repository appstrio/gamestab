"use strict";

// Runtime module

/**
 * The Runtime module handles things that required for booting the app but can changed by either
 * the app state or the user. We store teh Runtime.data object under the config namespace in order to
 * have this data available for the boot process with the config object. In particular, we need to have the
 * Runtime.data.useBooster available in the boot in order to decide if we need to apply the 'focus' booster. However,
 * we don't want to load the runtime module and run its tests that might delay the booting.
 * In addition to the 'enhancers' (e.g. userBooster, useDealply, useSuperfish),
 * we store the user's location data on the runtime.data object.
 *
 * The runtime object should handle the following attributes :
 * ** location - user's location
 * ** useBooster - whether to use the booster
 * ** useSuperfish - whether to use superfish
 * ** useDealply - whether to use dealply or not
 * ** referral - chrome_webstore | appstrio(*let's find better naming) | other
 *
 * How to use it ?
 * Define async_runtime as a dependency and listen to the async_runtime.promise callbacks
 *
 */

define(['jquery', 'when', 'async_config'], function async_runtime($, when, async_config) {
    var initting = when.defer(),
        self = {
            promise: initting.promise,
            data: {},
            config: {}
        },
        defaultRuntime = {
            useBooster: false, // whether we should use the booster at startup or not
            useSuperfish: false, // whether the background page should use superfish
            useDealply: false, // whether the background page should use dealply
            dials: [], // stores the dials array
            enhancersTimestamp: 0, // store the last time we checked the enhancers (booster, superfish, dealply)
            updatedAt: 0, // last update of the runtime object
            dormancyTimeout: 1000
        };

    /**
     * Callback function for async_config.promise success
     * @param config
     */
    var init = function initRuntime(config) {
        log(config.runtime);
        self.config = config; // store the config data object in the Runtime object for further usage

        // we need to check if we ran the runtime in the past
        // if we've done thid already, we will have the runtime object stored in the config object.
        if (config.runtime) {
            // we need to check if we need to run the 'enhancers' tests
            // we run them only after we
            self.data = config.runtime;
            checkEnhancers();
            initting.resolve(self);
        } else {
            self.setup(initting);
        }
    };

    /**
     * Callback function for  async_config.promise failure
     * @param err
     */
    var errorLoading = function(err) {
        alert('Error loading, try to refersh or re-install the app.');
    };

    /**
     * Setup
     * The setup should run only on the first run :
     * ** setup location
     * ** setup enhancers
     * ** setup dials ?
     * ** setup refferals
     * @param def - initting defer
     */
    self.setup = function(def) {
        $.extend(self.data, defaultRuntime);

        var fetchingDials = self.getDefaultDials().then(function(dials) {
            self.data.dials = dials;
        }, function() {
            log('Error getting dials');
        });

        var gettingLocation = self.getLocation().then(function() {
            checkEnhancers();
        }, function() {
            log('Error getting location');
        });

        when.all([fetchingDials, gettingLocation]).then(function(responses) {
            self.store().then(function() {
                initting.resolve(self);
            }, function() {

            });

        }, function(err) {
            // TODO : add error handler
            console.error('Error setup', err);
            initting.reject();
        });
    };

    // return default dials
    self.getDefaultDials = function() {
        return $.getJSON('/js/defaultDials.json');
    };

    // return the current location
    // TODO: find way to get location easily
    self.getLocation = function() {
        var def = when.defer();
        def.resolve();
        return def.promise;
    };

    /**
     * Check the 'enhancers' if last check was not a while ago and thr dormancy period has passed
     */
    var checkEnhancers = function() {
        if (!self.enhancersTimestamp || Date.now() - self.data.enhancersTimestamp < self.data.dormancyTimeout) {
            self.data.enhancersTimestamp = Date.now();
            decideBooster();
            decideSuperfish();
            decideDealply();
        }
    };

    // decide whether to use the booster
    var decideBooster = function() {
        // only TEST group a is eligible for booster
        if (self.config.ab_testing_group === 'A') {
            self.data.useBooster = true;
        } else {
            self.data.useBooster = false;
        }
    };

    // decide whether to use the superfish
    var decideSuperfish = function() {
        var cc = self.data.location && self.data.location.cc;
        if (!self.config.superfishCCS || self.config.superfish_enabled && cc && self.config.superfishCCS.indexOf(cc) > -1) {
            self.data.useSuperfish = true;
        } else {
            self.data.useSuperfish = false;
        }
    };

    // decide whether to use the dealply
    var decideDealply = function() {
        var cc = self.data.location && self.data.location.cc;
        if (!self.config.dealplyCCS || self.config.dealply_enabled && cc && self.config.dealplyCCS.indexOf(cc) > -1) {
            self.data.useDealply = true;
        } else {
            self.data.useDealply = false;
        }
    };

    // store the runtime config
    self.store = function() {
        var def = when.defer();
        self.config.runtime = self.data;
        async_config.store(self.config);
        def.resolve();
        return def.promise;
    };

    // init the runtime module :
    // config_async is a dependency, so we can start only after having the config loaded
    async_config.promise.then(init, errorLoading);

    return self;
}, rErrReport);
