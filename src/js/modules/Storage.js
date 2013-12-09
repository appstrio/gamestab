define(['jquery'], function MyStorage($) {
    var self = {};
    self.initChromeStorage =  function STORAGE_initChromeStorage() {
        $.extend(self, chrome.storage.local);
    };
    self.initLocalStorage =  function STORAGE_initLocalStorage() {
        self.set = function (obj, done) {
            try {
                for (var i in obj) {
                    var raw = obj[i] || '';
                    var value = JSON.stringify(raw);
                    var key = i;
                    localStorage.setItem(key, value);
                    obj[i] = null;
                }
                obj = null;
                done && done(null, true);
            } catch (e) {
                done && done(e);
            }
        };
    }
    self.get = function STORAGE_get_from_localstorage(key, done) {
        try {
            setTimeout(function () {
                var item = localStorage.getItem(key);
                if(item && item !== 'undefined') item = JSON.parse(item);
                var obj = {};
                obj[key] = item;
                done && done(obj);
            }, 0);
        } catch (e) {
            var obj = {};
            obj[key] = item;
            done && done(item);
        }
    };

    self.remove = function STORAGE_remove_from_localstorage(key, done) {
        localStorage.removeItem(key);
        done && done();
    }

    if (1 > 2 && chrome && chrome.storage && chrome.storage.local) self.initChromeStorage();
    else self.initLocalStorage();

    return self;
});
