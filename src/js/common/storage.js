angular.module('aio.storage', []);
angular.module('aio.storage').factory('Storage', ['$rootScope', 'Chrome',
    function ($rootScope, Chrome) {
        //variant of https://gist.github.com/Contra/6368485

        var storageDevice = (function () {
            var isStorageAvailable = function (storage) {
                if (typeof storage == 'undefined') {
                    return false;
                }
                try { // hack for safari incognito
                    var __storage = window[storage];
                    return typeof __storage !== 'undefined' &&
                        __storage.setItem &&
                        __storage.getItem &&
                        __storage.removeItem && window[storage];
                } catch (err) {
                    return false;
                }
            };
            var localStorageAvailable = isStorageAvailable('localStorage');

            if (localStorageAvailable) {
                return localStorageAvailable;
            }
            var Storage = function (type) {
                function createCookie(name, value, days) {
                    var date, expires;

                    if (days) {
                        date = new Date();
                        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date.toGMTString();
                    } else {
                        expires = "";
                    }
                    document.cookie = name + "=" + value + expires + "; path=/";
                }

                function readCookie(name) {
                    var nameEQ = name + "=",
                        ca = document.cookie.split(';'),
                        i, c;

                    for (i = 0; i < ca.length; i++) {
                        c = ca[i];
                        while (c.charAt(0) == ' ') {
                            c = c.substring(1, c.length);
                        }

                        if (c.indexOf(nameEQ) == 0) {
                            return c.substring(nameEQ.length, c.length);
                        }
                    }
                    return null;
                }

                function setData(data) {
                    data = JSON.stringify(data);
                    if (type == 'session') {
                        window.name = data;
                    } else {
                        createCookie('localStorage', data, 365);
                    }
                }

                function clearData() {
                    if (type == 'session') {
                        window.name = '';
                    } else {
                        createCookie('localStorage', '', 365);
                    }
                }

                function getData() {
                    var data = type == 'session' ? window.name : readCookie('localStorage');
                    return data ? JSON.parse(data) : {};
                }

                // initialise if there's already data
                var data = getData();

                return {
                    length: 0,
                    clear: function () {
                        data = {};
                        this.length = 0;
                        clearData();
                    },
                    getItem: function (key) {
                        return data[key] === undefined ? null : data[key];
                    },
                    key: function (i) {
                        // not perfect, but works
                        var ctr = 0;
                        for (var k in data) {
                            if (ctr == i) return k;
                            else ctr++;
                        }
                        return null;
                    },
                    removeItem: function (key) {
                        if (data[key] === undefined) this.length--;
                        delete data[key];
                        setData(data);
                    },
                    setItem: function (key, value) {
                        if (data[key] === undefined) this.length++;
                        data[key] = value + ''; // forces the value to a string
                        setData(data);
                    }
                };
            };
            return new Storage('localStorage');
        })();

        var localStorageAbstraction = {
            get: function (key, cb) {
                var raw = storageDevice.getItem(key);
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
                                storageDevice.setItem(i, stringified);
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
                        storageDevice.removeItem(key);
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
