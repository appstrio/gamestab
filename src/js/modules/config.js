"use strict";

// Config module

/**
 * The Config module handles the build specific config settings as well as the on-going runtime data.
 * The config settings could be loaded from the config file (e.g. 'production.json') or from the remote server.
 * The runtime data is determined by the Runtime module. The reason why it is stored on the config is to have this data
 * available as quick as the app starts without waiting for the Runtime module.
 *
 * How to use it ?
 * Define config as dependency and listen to the config.promise callbacks.
 * then use config.data to access the config attributes or config.store to store the config object in the localstorage
 *
 */

define(['env', 'jquery', 'Storage', 'when'], function Config(env, $, storage, when) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Config");

    var storageKey      = "config",
        pathToBuildJSON = '/js/data/build.json',
        initting        = when.defer(),
        self = {
            promise: initting.promise,
            data: {},
        },
        defaultValues;

    if(env.DEBUG && env.exposeModules) window.Config = self;

    /**
     * Loads the config data from localStorage or file.
     */
    var init = function initModule() {

        defaultValues = {
            timestamp: Date.now(),
            ab_testing_group: ((Math.random() > 0.5) ? "A" : "B"),
            install_week_number: weekNumber(),
            client_version: (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : ''
        };

        // Try to fetch appdata from the localstorage
        var data = storage.get(storageKey);
        if(env.DEBUG && env.forceRefreshConfigData) data = null;

        if (data) {
            self.data = data;
            if (setDefaultConfigSettings()) {
                self.store();
            }
            initting.resolve(self.data);
        } else {
            // Or try to load it from the JSON that's included with the extension
            $.getJSON(pathToBuildJSON).then(function(fetchedConfig) {
                self.data = fetchedConfig;
                setDefaultConfigSettings();
                self.store();
                initting.resolve(self.data);
            }).fail(console.warn);
        }
    }

    /**
     * Store the config file in the localstorage
     */
    self.store = function(data) {
        self.data = data || self.data;
        storage.set(storageKey, self.data);
    };

    /**
     * Helper function to get the week number without using 3rd party libs
     * @returns {number}
     */
    var weekNumber = function() {
        var newdate = new Date();
        var onejan = new Date(newdate.getFullYear(), 0, 1);
        return Math.ceil((((newdate - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    };


    /**
     * set default values for the config data
     * @returns {boolean} - need to store(?)
     */
    var setDefaultConfigSettings = function() {
        var needToStore = false;

        for (var i in defaultValues) {
            if (!self.data[i]) {
                self.data[i] = defaultValues[i];
                needToStore = true;
            }
        }

        return needToStore;
    };

    init();

    return self;
}, rErrReport);
