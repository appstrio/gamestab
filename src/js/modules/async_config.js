define(['env','jquery'],function Config(env,$) {
    // Loaded Dynamically
    var key = "config",
        storage = new MyStorage(),
        self = {},
        path : '',
        config: {},
        deferred = new $.Deferred();

    self.init = (function () {
        // get the config object from the localstorage or from the file
        this.loadFromStorage(function (err, _localConfig) {
            if (!err && _localConfig) {
                self.config = _localConfig;
                self.setDefaults(_localConfig);
                self.setClientVersion();
                deferred.resolve(self);
            } else {
                self.loadFromFile(function (err, _fileConfig) {
                    if (_fileConfig) {
                        self.config = _fileConfig;
                        self.setDefaults(_localConfig);
                        self.setClientVersion();
                        deferred.resolve(self);
                    } else {
                        deferred.resolve(self);
                    }
                });
            }
        });
    })();

    self.loadFromStorage = function (done) {
        this.storage.get(this.key, function (result) {
            done && done(null, result[self.key]);
        });
    };
    self.loadFromFile = function (done) {
        var env = env.toLowerCase(),
            path = self.path + '/'
        $.getJSON('/' + env + '.json', function (result) {
            if (result.config) {
                result.config.timestamp = Date.now();

                self.setDefaults(result.config, function () {
                    done && done(null, result.config);
                });

            } else {
                done && done('Config file is empty');
            }

        }, function (err) {
            done && done(err);
        });
    };
    self.setDefaults = function (obj, done) {
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
    self.setClientVersion = function () {
        self.client_version = (chrome && chrome.app && chrome.app.getDetails()) ? chrome.app.getDetails().version : '';
    };
    self.storeConfigObject = function (_config, done) {
        _config = _config || self;
        var objToStore = {};
        objToStore[this.key] = _.extend({}, _config);
        this.storage.set(objToStore, done);
    };

    return deferred.promise();
});
