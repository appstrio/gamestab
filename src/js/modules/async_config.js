var env = {
    type: "production",
    force:{
        loadConfigFromFile:true
    },
    debug:true
};

define(['jquery','storage'], function config($,storage) {
    var key = "config",
        deferred = new $.Deferred(),
        self = {
            data: deferred.promise()
        };

    // self.initChromeStorage = function STORAGE_initChromeStorage() {
    //     $.extend(self, chrome.storage.local);
    // };

    self.init = (function() {
        // Try to fetch appdata from the localstorage
        var data = storage.get("data");
        if(!(env.debug && env.force.loadConfigFromFile) && data)
            deferred.resolve(data);
        else {
            // Or try to load it from the JSON that's included with the extension
            hello = $.getJSON('/js/' + env.type + '.json').then(function (fetchedConfig) {
                data = fetchedConfig;
                data.timestamp = Date.now(); // TODO: @hlandao Do we want this ever refreshed?
                data.ab_testing_group = (Math.random() > 0.5) ? "A" : "B";
                data.install_week_number = 99; //// TODO: Refactor moment.week() method [ https://github.com/moment/moment/search?q=week%28&type=Code ]
                data.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
                storage.set('data',data);
                deferred.resolve(data);
            }).fail(function  (argument) {
                alert(JSON.stringify(argument));
            });
        }
    })();

    return self.data;
});
