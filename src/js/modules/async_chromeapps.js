define(['jquery'], function async_chromeapps($) {
    var self = {},
        deferred = new $.Deferred();

    self.init = (function() {
        chrome.management.getAll(function(apps) {
            for (var i = 0; i < apps.length; i++) {
                if(apps[i].isApp)
                    apps[i].icon = app.icons.last().url;
            };
            self.apps = apps || [];
            deferred.resolve(self);
        });
    })();

    return deferred.promise();
});
