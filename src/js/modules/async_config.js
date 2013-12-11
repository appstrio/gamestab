var env = {
    type: "production"
};

define(['jquery','storage'], function config($,storage) {
    var key = "config",
        deferred = new $.Deferred(),
        self = {
            data: deferred.promise()
        };

    self.loadFromFile = function(done) {
        var path = 'js/' + env.type + '.json',
            deferred = new $.Deferred();
        $.getJSON(path, deferred.resolve, deferred.fail);
        return deferred;
    };

    // self.initChromeStorage = function STORAGE_initChromeStorage() {
    //     $.extend(self, chrome.storage.local);
    // };

    self.init = (function() {
        // Try to fetch appdata from the localstorage
        var data = storage.get("data");
        if(data)
            deferred.resolve(data);
        else {
            // Or try to load it from the JSON that's included with the extension
            self.loadFromFile().then(function (fetchedConfig) {
                data = fetchedConfig;
                data.timestamp = Date.now(); // TODO: @hlandao Do we want this ever refreshed?
                data.ab_testing_group = (Math.random() > 0.5) ? "A" : "B";
                data.install_week_number = 99; //// TODO: Refactor moment.week() method [ https://github.com/moment/moment/search?q=week%28&type=Code ]
                data.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
                storage.set('data',data);
                deferred.resolve(data);
            }).fail(deferred.fail);
        }
    })();

    return self.data;
});
