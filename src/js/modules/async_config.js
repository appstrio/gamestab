"use strict";

define(['jquery', 'storage', 'env', 'when'], function config($, storage, env, when) {
    var key = "config",
        def = when.defer(),
        self = {};

    var getConfig = function () {
        return storage.get("config");
    }
    self.storeConfig = function(){
        return storage.set("config", self.config);
    }

    // get week number
    var weekNumber = function(){
        var newdate = new Date();
        var onejan = new Date(newdate.getFullYear(),0,1);
        return Math.ceil((((newdate - onejan) / 86400000) + onejan.getDay()+1)/7);
    };

    self.init = (function() {
        // Try to fetch appconfig from the localstorage
        var config = getConfig();
        if (!(env.debug && env.force.loadConfigFromFile) && config) {
            self.config = config;
            def.resolve(self);
        }
        else {
            // Or try to load it from the JSON that's included with the extension
            $.getJSON('/js/' + env.type + '.json').then(function(fetchedConfig) {
                config = fetchedConfig;
                config.timestamp = Date.now(); // TODO: @hlandao Do we want this ever refreshed?, @daniel - yes we might use the server to update this part.
                config.ab_testing_group = (Math.random() > 0.5) ? "A" : "B";
                config.install_week_number = weekNumber();
                config.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
                storeConfig(key, config);
                self.config = config;
                def.resolve(self);
            }).fail(function(argument) {
                alert(JSON.stringify(argument));
            });
        };
    })();

    return def.promise;
}, rErrReport);
