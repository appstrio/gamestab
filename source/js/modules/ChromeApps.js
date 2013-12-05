function ChromeApps(done){
    var self = this;
    chrome.management.getAll(function(apps){
        apps = apps || [];
        self.apps = _.reject(apps, function(app){return !app.isApp});
        _.each(self.apps, function(app){
            app.icon = app.icons.last().url;
        });


        done && done();
    });

};