function Config() {
    this.key = "config";
    this.storage = new MyStorage();
}
Config.prototype.init = function(done) {
    var self = this;
    this.loadFromStorage(function(err, _localConfig) {
        if (_localConfig) {
            self.config = _localConfig;
            self.setDefaults(_localConfig);
            self.setClientVersion();
            done && done(_localConfig);
        } else {
            self.loadFromFile(function(err, _fileConfig) {
                if (_fileConfig) {
                    self.config = _fileConfig;
                    self.setClientVersion();
                    done && done(_fileConfig);

                } else {
                    // ERROR LOADING CONFIG
                }
            });

        }
    });
};
Config.prototype.loadFromStorage = function(done) {
    var self = this;
    this.storage.get(this.key, function(result) {
        (done || self.noop)(null, result[self.key]);
    });
};
Config.prototype.loadFromFile = function(done) {
    var env = ENV.toLowerCase(),
        self = this;

    $.getJSON('/' + env + '.json', function(result) {
        console.log('result', result);
        if (result.config) {
            result.config.timestamp = Date.now();

            // cache build options
            var buildOptions = result.config.build_options;

            // override buildOptions by config options
            var tempConfig = _.extend(buildOptions, result.config);
            // delete temp build_options
            delete tempConfig.build_options;

            // copy temp config
            var real_config = _.extend({}, tempConfig);
            // re-add build options
            real_config.build_options = buildOptions;

            console.log('real_config', real_config);

            self.setDefaults(real_config, function() {
                done && done(null, real_config);
            });

        } else {
            done && done('Config file is empty');
        }



    }, function(err) {
        done && done(err);
    });
};
Config.prototype.setDefaults = function(obj, done) {
    var needToStore;

    if (!obj.timestamp) {
        obj.timestamp = Date.now();
        needToStore = true;
    }

    if (!obj.ab_testing_group) {
        obj.ab_testing_group = (Math.random() > 0.5) ? "A" : "B";
        needToStore = true;
    }

    if (!obj.install_week_number) {
        obj.install_week_number = new Date().getWeek();
        needToStore = true;
    }

    if (needToStore) {
        this.storeConfigObject(obj, done);
    } else {
        done && done();
    }

};
Config.prototype.setClientVersion = function() {
    this.config.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';

};
Config.prototype.storeConfigObject = function(_config, done) {
    _config = _config || this.config;
    var objToStore = {};
    objToStore[this.key] = _.extend({}, _config);
    this.storage.set(objToStore, done);
};
