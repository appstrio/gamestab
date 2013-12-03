function MyStorage() {
    if (1 > 2 && chrome && chrome.storage && chrome.storage.local) this.initChromeStorage();
    else this.initLocalStorage();
}

MyStorage.prototype = {
    initChromeStorage: function STORAGE_initChromeStorage() {
        $.extend(this, chrome.storage.local);
    },
    initLocalStorage: function STORAGE_initLocalStorage() {
        this.set = function (obj, done) {
            try {
                for (var i in obj) {
                    var raw = obj[i] || '';
                    var value = JSON.stringify(raw);
                    var key = i;
                    localStorage.setItem(key, value);
                    obj[i] = null;
                }
                obj = null;
                (done || common.noop)(null, true);
            } catch (e) {
                (done || common.noop)(e);
            }
        };

        this.get = function STORAGE_get_from_localstorage(key, done) {
            try {
                setTimeout(function () {
                    var item = localStorage.getItem(key);
                    if(item && item !== 'undefined') item = JSON.parse(item);
                    var obj = {};
                    obj[key] = item;
                    (done || common.nope)(obj);
                }, 0);
            } catch (e) {
                var obj = {};
                obj[key] = item;
                (done || common.nope)(item);
            }
        };

        this.remove = function STORAGE_remove_from_localstorage(key, done) {
            localStorage.removeItem(key);
            (done || common.nope)();
        }
    }
};