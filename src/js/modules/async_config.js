define(['underscore', 'jquery', 'moment', 'env', 'storage'], function Config(underscore, $, moment, env, storage) {
    // Loaded Dynamically
    var key = "config",
        self = {
            path: 'js',
            config: {},
            storage: storage
        },
        deferred = new $.Deferred();

    self.loadFromStorage = function(done) {
        self.storage.get(key, function(result) {
            done && done(null, result[key]);
        });
    };
    self.loadFromFile = function(done) {
        var env = env.env.toLowerCase(),
            path = self.path + '/' + env + '.json';
        $.getJSON(path, function(result) {
            if (result.config) {
                result.config.timestamp = Date.now();

                self.setDefaults(result.config, function() {
                    done && done(null, result.config);
                });

            } else {
                done && done('Config file is empty');
            }
        }, function(err) {
            done && done(err);
        });
    };
    self.setDefaults = function(obj, done) {
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
            obj.install_week_number = moment().week();
            needToStore = true;
        }
        if (needToStore) {
            self.storeConfigObject(obj, done);
        } else {
            done && done();
        }
    };
    self.setClientVersion = function() {
        self.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
    };
    self.storeConfigObject = function(_config, done) {
        _config = _config || self;
        var objToStore = {};
        objToStore[key] = _.extend({}, _config);
        self.storage.set(objToStore, done);
    };

    self.init = (function() {
        // get the config object from the localstorage or from the file
        self.loadFromStorage(function(err, _localConfig) {
            if (!err && _localConfig) {
                self.config = _localConfig;
                self.setDefaults(_localConfig);
                self.setClientVersion();
                deferred.resolve(self);
            } else {
                self.loadFromFile(function(err, _fileConfig) {
                    if (_fileConfig) {
                        self.config = _fileConfig;
                        self.setDefaults(_fileConfig);
                        self.setClientVersion();
                        deferred.resolve(self);
                    } else {
                        deferred.resolve(self);
                    }
                });
            }
        });
    })();

    return deferred.promise();
});
