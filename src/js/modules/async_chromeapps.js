define(function async_chromeapps() {
    var self = {},
deferred = new $.Deferred();

    self.init = function(done) {
        chrome.management.getAll(function(apps){
            apps = apps || [];
            self.apps = _.reject(apps, function(app){return !app.isApp});
            _.each(self.apps, function(app){
                app.icon = app.icons.last().url;
            });

            deferred.resolve(self);
        });
    }

    return deferred.promise();
});