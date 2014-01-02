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
 * ** referral - chrome_webstore | appstrio(*let's find better naming) | other
 *
 * How to use it ?
 * Define runtime
 as a dependency and listen to the runtime
.promise callbacks
 *
 */

define(["env", "jquery", "when", "underscore", "Config"], function Runtime(env, $, when, _, Config) {
    if (DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : Runtime");

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            data: {},
            config: {},
        },
        defaultRuntime = {
            useBooster: false, // whether we should use the booster at startup or not
            enhancersTimestamp: 0, // store the last time we checked the enhancers (booster, superfish, dealply)
            updatedAt: 0, // last update of the runtime object
            countryCode: "us", // Default Country Code
            JSONPrefix: "/data",
            // Default values for properties that can be overrided from config
            dormancyTimeout: 1000,
            defaultDialsByCountryEnabled: true,
            AndroItEnabled: true,
            maxDials: 18,
            fromChromeWebstore: true
        };

    if (DEBUG && DEBUG.exposeModules) window.Runtime = self;

    /**
     * Callback function for config.promise success
     * @param config
     */
    var init = function initRuntime(configData) {
        self.config = configData; // store the config data object in the Runtime object for further usage

        // we need to check if we ran the runtime in the past
        // if we've done thid already, we will have the runtime object stored in the config object.

        if (DEBUG && DEBUG.forceRefreshRuntimeData) self.config.runtime = null;

        if (self.config.runtime) {
            // we need to check if we need to run the 'enhancers' tests
            // we run them only after we
            self.data = self.config.runtime;

            checkEnhancers();
            initting.resolve(self.data);
        } else {
            setupModule(configData);
        }
    };

    /**
     * Setup
     * The setup should run only on the first run :
     * ** setup location
     * ** setup enhancers
     * ** setup referrals
     */
    var setupModule = function(configData) {
        $.extend(self.data, defaultRuntime, configData.runtime_overriders);
        if (window.isChromeApp) {
            var gettingLocation = getCountry(), checkfromChromeWebstore = when.defer();

            if (configData.install_page) {
                chrome.history.search({
                    text: configData.install_page,
                    maxResults: 10,
                    startTime: 0
                }, checkfromChromeWebstore.resolve);
            } else {
                checkfromChromeWebstore.resolve();
            }

            when.all([
                gettingLocation,
                checkfromChromeWebstore
            ]).done(function(values) {
                var countrycode = values[0],
                    entries = values[1];
                self.data.countryCode = countrycode;
                if (entries) {
                    self.data.fromChromeWebstore = entries.length > 0;
                }

                checkEnhancers();

                self.store();
                initting.resolve(self.data);
            });
        } else {
            checkEnhancers();
            self.store();
            initting.resolve(self.data);
        }

        return initting.promise;
    };

    var getCountry = function() {
        var def = when.defer(),
            Position = function() {
                if (arguments[0] && !arguments[1]) {
                    $.extend(this, arguments[0]);
                } else {
                    this.latitude = arguments[0];
                    this.longitude = arguments[1];
                }
            };
        Position.prototype.toString = function positionToString() {
            return this.latitude + "," + this.longitude;
        };
        if (window.navigator.geolocation) {
            var getCountry = function(_pos) {
                var position = new Position(_pos.coords),
                    url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + position + "&sensor=false",
                    fetchJSON = when($.get(url));

                fetchJSON.then(function(json) {
                    var step1 = json.results[0].address_components,
                        step2 = step1[step1.length - 1].short_name.toLowerCase();

                    def.resolve(step2);
                });
            };
            navigator.geolocation.getCurrentPosition(getCountry, alert, {
                maximumAge: Infinity,
                timeout: 5000
            });
        }
        return def.promise;
    };

    /**
     * Check the 'enhancers' if last check was not a while ago and thr dormancy period has passed
     */
    var checkEnhancers = function() {
        if (!self.enhancersTimestamp || Date.now() - self.data.enhancersTimestamp < self.data.dormancyTimeout) {
            self.data.enhancersTimestamp = Date.now();
            decideBooster();
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


    // store the runtime config
    self.store = function() {
        self.config.runtime = self.data;
        Config.store(self.config);
        return when.resolve(self.data);
    };

    // init the runtime module :
    // config_async is a dependency, so we can start only after having the config loaded
    Config.promise.then(init, env.errhandler);

    return self;
}, console.warn);
