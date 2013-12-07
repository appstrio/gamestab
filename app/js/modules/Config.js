function Config(){
    this.key = "config";
    this.storage = new MyStorage();
}

Config.prototype.init = function(done){
    var self = this;

    // get the config object from the localstorage or from the file
    this.loadFromStorage(function(err, _localConfig){
        if(!err && _localConfig){
            self.config = _localConfig;
            self.setDefaults(_localConfig);
            self.setClientVersion();
            done && done(null, _localConfig);
        }else{
            self.loadFromFile(function(err, _fileConfig){
                if(_fileConfig){
                    self.config = _fileConfig;
                    self.setDefaults(_localConfig);
                    self.setClientVersion();
                    done && done(null, _fileConfig);
                }else{
                    done && done(true);
                }
            });

        }
    });
};

// load the config object from localstorage
Config.prototype.loadFromStorage = function(done){
    var self = this;
    this.storage.get(this.key, function(result){
        done && done(null, result[self.key]);
    });
};


// load the config object from file
Config.prototype.loadFromFile = function(done){
    var env = ENV.toLowerCase(),
        self = this;

    $.getJSON('/' + env + '.json', function(result){
        if(result.config){
            result.config.timestamp = Date.now();

            self.setDefaults(result.config, function(){
                done && done(null, result.config);
            });

        }else{
            done && done('Config file is empty');
        }

    }, function(err){
        done && done(err);
    });
};



// set the config object defaults
Config.prototype.setDefaults = function(obj, done){
    var needToStore;

    if(!obj.timestamp){
        obj.timestamp = Date.now();
        needToStore=true;
    }

    if(!obj.ab_testing_group){
        obj.ab_testing_group = (Math.random() > 0.5) ? "A" : "B" ;
        needToStore=true;
    }

    if(!obj.install_week_number){
        obj.install_week_number = new Date().getWeek();
        needToStore=true;
    }

    if(needToStore){
        this.storeConfigObject(obj,done);
    }else{
        done && done(null);
    }

};


// get client version from the chrome manifest
Config.prototype.setClientVersion = function(){
    this.config.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : 0;

};


// store config object in the localstorage
Config.prototype.storeConfigObject = function(_config, done){
    _config = _config || this.config;
    var objToStore = {};
    objToStore[this.key] = _.extend({},_config);
    this.storage.set(objToStore, done);
};

