define(['screenshot'], function Topsites(screenshot) {
    var self = {}, deferred = new $.Deferred();
    self.maximumDiasAmount = 8;
    self.key = "topsites";
    self.ignoreListKey = "ignoreList";
    self.storage = new MyStorage();
    self.screenshot = screenshot;

    self.init = (function() {
        self.getIgnoreList(function(err, _ignoreList) {
            self.ignoreList = _ignoreList || [];
            self.get(function(err, _topsites) {
                if (err) {
                    self.getFromChrome(function(_topsites) {
                        self.topsites = self.removeIgnored(_topsites, self.ignoreList);
                        self.topsites = self.topsites.slice(0, self.maximumDiasAmount);
                        self.fillScreenshots(self.topsites);
                        deferred.resolve(self);
                    });
                } else {

                    self.topsites = self.removeIgnored(_topsites, self.ignoreList);

                    self.fillScreenshots(self.topsites);
                    deferred.resolve(self);
                }
            });
        })
    })();

    self.get = function(done) {
        self.storage.get(self.key, function(result) {
            if (result && result[self.key]) {
                done && done(null, result[self.key]);
            } else {
                done && done(true);
            }
        });
    };

    self.addNewDial = function(dial, done) {

        if (!dial) return done && done(true);

        self.topsites.push(dial);
        console.log(dial, 'dial0');

        self.store(function() {
            console.log(dial, 'dial', done);
            return done && done(null, dial);
        });
    };

    self.getAndAddNewDial = function(done) {


        self.getNewDials(function(err, newDials) {
            if (newDials && newDials.length) {
                self.addNewDial(newDials[0], done);
            } else {
                done && done(true);
            }
        });
    };

    self.getNewDials = function(done) {

        self.getFromChrome(function(_topsites) {
            var diffArr = _.reject(_topsites, function(site) {
                if (_.findWhere(self.topsites, {
                    url: site.url
                })) return true;
                if (self.ignoreList.indexOf(site.url) > -1) return true;
                return false;
            });
            done && done(null, diffArr);
        });
    };

    self.store = function(callback) {

        var objToStore = {};
        objToStore[self.key] = self.topsites;
        self.storage.set(objToStore, callback);
    };

    self.getFromChrome = function(callback) {
        chrome.topSites.get(callback);
    };

    self.getIgnoreList = function(done) {

        this.storage.get(this.ignoreListKey, function(result) {
            var _ignoreList = result[self.ignoreListKey] || [];
            done(null, _ignoreList);
        });
    };

    self.storeIgnoreList = function(list, done) {
        var objToStore = {};
        objToStore[self.ignoreListKey] = list;
        this.storage.set(objToStore, done);
    };

    self.removeIgnored = function(topsites, ignoreList) {
        _.each(ignoreList, function(url) {
            var found = _.findWhere(topsites, {
                url: url
            });
            if (found) {
                topsites.remove(found);
            }
        });

        return topsites;
    };

    self.addToIgnored = function(url, ignoreList) {
        var found = _.findWhere(self.topsites, {
            url: url
        });
        if (found) {
            self.topsites.remove(found);
        }

        self.ignoreList.push(url);

        self.storeIgnoreList(self.ignoreList);
    };

    self.fillScreenshots = function(topsites) {
        _.each(topsites, function(site) {
            if (site.screenshot || site.screenshotsRetries > 4) {

            } else {
                site.screenshotDefer = $.Deferred();

                self.screenshot.capture({
                    url: site.url
                }, function(err, screenshotURL) {
                    if (screenshotURL) {
                        site.screenshot = screenshotURL;
                        site.screenshotDefer.resolve();
                        self.store();
                    } else {
                        site.screenshotsRetries = site.screenshotsRetries || 0;
                        ++site.screenshotsRetries;
                        site.screenshotDefer.reject();
                        self.store();
                    }
                });
            }

        });

        return topsites;
    };

    return deferred.promise();
});
