var storageModule = angular.module('aio.storage', []);

storageModule.factory('Storage', ['$rootScope', 'Chrome',
    function ($rootScope, Chrome) {
        var localStorageAbstraction = {
            get: function (key, cb) {
                var raw = localStorage.getItem(key);
                cb = cb || angular.noop;
                setTimeout(function () {
                    try {
                        var output = {};
                        output[key] = JSON.parse(raw);
                        cb(output);
                    } catch (e) {
                        console.error('Uncaught error:', e);
                        cb();
                    }
                }, 0);
            },
            set: function (items, cb) {
                var item, stringified;
                cb = cb || angular.noop;
                setTimeout(function () {
                    try {
                        for (var i in items) {
                            if (items.hasOwnProperty(i)) {
                                item = items[i];
                                stringified = JSON.stringify(item);
                                localStorage.setItem(i, stringified);
                            }
                        }
                        cb(1);
                    } catch (e) {
                        console.error('Uncaught error:', e);
                        cb();
                    }
                });
            },
            remove: function (key, cb) {
                cb = cb || angular.noop;
                setTimeout(function () {
                    try {
                        localStorage.removeItem(key);
                        cb(1);
                    } catch (e) {
                        console.error('Uncaught error:', e);
                        cb();
                    }
                }, 0);
            }
        };

        var StorageArea = localStorageAbstraction || Chrome.storage.local;
        return {
            get: function (keys, cb) {
                cb = cb || angular.noop;
                StorageArea.get(keys, function (items) {
                    $rootScope.$apply(function () {
                        cb(items);
                    });
                });
            },

            set: function (items, cb) {
                cb = cb || angular.noop;
                StorageArea.set(items, function () {
                    $rootScope.$apply(function () {
                        cb();
                    });
                });
            },

            setItem: function (key, item, cb) {
                var objToStore = {};
                objToStore[key] = item;
                StorageArea.set(objToStore, cb);
            },

            remove: function (keys, cb) {
                cb = cb || angular.noop;
                StorageArea.remove(keys, function () {
                    $rootScope.$apply(function () {
                        cb();
                    });
                });
            }
        };
    }
]);
