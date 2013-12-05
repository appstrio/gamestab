function Topsites(screenshot, done){
    var self = this;
    self.maximumDiasAmount = 8;
    self.key = "topsites";
    self.ignoreListKey = "ignoreList";
    self.storage = new MyStorage();
    self.screenshot = screenshot;

    self.getIgnoreList(function(err, _ignoreList){
        self.ignoreList = _ignoreList || [];
        self.get(function(err, _topsites){
            if(err){
                self.getFromChrome(function(_topsites){
                    self.topsites = self.removeIgnored(_topsites, self.ignoreList);
                    self.topsites = self.topsites.slice(0, self.maximumDiasAmount);
                    self.fillScreenshots(self.topsites);
                    done && done();
                });
            }else{

                self.topsites = self.removeIgnored(_topsites, self.ignoreList);

                self.fillScreenshots(self.topsites);
                done && done();
            }
        });

    })
};


Topsites.prototype.get = function(done){
    var self = this;
   self.storage.get(self.key, function(result){
      if(result && result[self.key]){
          done && done(null, result[self.key]);
      }else{
          done && done(true);
      }
   });
};

Topsites.prototype.addNewDial = function(dial, done){
  var self = this;
  if(!dial) return done && done(true);

  self.topsites.push(dial);
    console.log(dial,'dial0');

    self.store(function(){
      console.log(dial,'dial',done);
      return done && done(null, dial);
  });
};

Topsites.prototype.getAndAddNewDial = function(done){
    var self = this;

    self.getNewDials(function(err, newDials){
        if(newDials && newDials.length){
            self.addNewDial(newDials[0], done);
        }else{
            done && done(true);
        }
    });
};


Topsites.prototype.getNewDials = function(done){
    var self = this;
    self.getFromChrome(function(_topsites){
        var diffArr = _.reject(_topsites, function(site){
            if (_.findWhere(self.topsites, {url : site.url})) return true;
            if (self.ignoreList.indexOf(site.url) > -1) return true;
            return false;
        });
        done && done(null, diffArr);
    });
};

Topsites.prototype.store = function(callback){
    var self = this;
    var objToStore = {};
    objToStore[self.key] = self.topsites;
    self.storage.set(objToStore, callback);
};



Topsites.prototype.getFromChrome = function(callback){
    chrome.topSites.get(callback);
};

Topsites.prototype.getIgnoreList = function(done){
    var self = this;
    this.storage.get(this.ignoreListKey, function(result){
        var _ignoreList = result[self.ignoreListKey] || [];
        done(null, _ignoreList);
    });
};


Topsites.prototype.storeIgnoreList = function(list, done){
    var self = this;
    var objToStore = {};
    objToStore[self.ignoreListKey] = list;
    this.storage.set(objToStore, done);
};


Topsites.prototype.removeIgnored = function(topsites, ignoreList){
    _.each(ignoreList, function(url){
        var found = _.findWhere(topsites, { url : url});
        if(found){
            topsites.remove(found);
        }
    });

    return topsites;
};

Topsites.prototype.addToIgnored = function(url, ignoreList){
    var self = this;
    var found = _.findWhere(self.topsites, {url : url});
    if(found){
        self.topsites.remove(found);
    }

    self.ignoreList.push(url);

    self.storeIgnoreList(self.ignoreList);
};



Topsites.prototype.fillScreenshots = function(topsites){
    var self = this;
    _.each(topsites, function(site){
        if(site.screenshot || site.screenshotsRetries > 4){

        }else{
            site.screenshotDefer = $.Deferred();

            self.screenshot.capture({url : site.url}, function(err, screenshotURL){
               if(screenshotURL){
                   site.screenshot = screenshotURL;
                   site.screenshotDefer.resolve();
                   self.store();
               }else{
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







