"use strict";

define(['jquery', 'storage', 'env'], function config($, storage, env) {
    var key = "config",
        deferred = new $.Deferred(),
        self = {
            data: deferred.promise()
        };

    self.init = (function() {
        // Try to fetch appdata from the localstorage
        var data = storage.get(key);
        if (!(env.debug && env.force.loadConfigFromFile) && data)
            deferred.resolve(data);
        else {
            // Or try to load it from the JSON that's included with the extension
            $.getJSON('/js/' + env.type + '.json').then(function(fetchedConfig) {
                data = fetchedConfig;
                data.timestamp = Date.now(); // TODO: @hlandao Do we want this ever refreshed?, @daniel - yes we might use the server to update this part.
                data.ab_testing_group = (Math.random() > 0.5) ? "A" : "B";
                data.install_week_number = weekNumber();
                data.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
                storage.set(key, data);
                deferred.resolve(data);
            }).fail(function(argument) {
                alert(JSON.stringify(argument));
            });
        }
    })();


    self.store = function(data){
        console.log('data',data);
        storage.set(key, data);
    }

    // get week number
    var weekNumber = function(){
        var newdate = new Date();
        var onejan = new Date(newdate.getFullYear(),0,1);
        return Math.ceil((((newdate - onejan) / 86400000) + onejan.getDay()+1)/7);
    };


    return self.data;
}, rErrReport);
