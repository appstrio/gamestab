'use strict';

define(['env', 'when'], function Storage(env, when) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : Storage");
    var self = {};

    // TODO : localstorage is not async, but chrome.storage is http://developer.chrome.com/extensions/storage.html#type-StorageArea
    // Should we switch to it?

    self.set = function(key, obj) {
        var def = when.defer();
        self[key] = JSON.stringify(obj);
        localStorage.setItem(key, self[key]);
    };

    self.get = function STORAGE_get_from_localstorage(key) {
        if (self[key])
            return self[key];
        else // ProTip: getItem returns null (not undefined) if no item.
            try {
                return self[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                console.log("storage.js err");
                return {};
            }
    };

    self.remove = function STORAGE_remove_from_localstorage(key) {
        self[key] = undefined;
        localStorage.removeItem(key);
    };

    return self;
});
