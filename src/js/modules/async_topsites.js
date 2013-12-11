define(['underscore','jquery','storage'],  function Topsites(underscore, $, storage) {

    var self = {}, deferred = new $.Deferred(),
        key = "topsites";
    self.maximumDialsAmount = 8;
    self.ignoreListKey = "ignoreList";
    self.storage = storage;

    self.store = function(callback) {
        var objToStore = {};
        objToStore[key] = self.topsites;
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

    self.init = (function() {
        self.getIgnoreList(function(err, _ignoreList) {
            self.ignoreList = _ignoreList || [];
            self.get(function(err, _topsites) {
                if (err) {
                    self.getFromChrome(function(_topsites) {
                        self.topsites = self.removeIgnored(_topsites, self.ignoreList);
                        self.topsites = self.topsites.slice(0, self.maximumDialsAmount);
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

    return deferred.promise();
});
