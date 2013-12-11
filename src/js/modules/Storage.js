define(function storage() {
    var self = {};

    self.set = function(key, obj) {
        self[key] = JSON.stringify(obj);
        localStorage.setItem(key, self[key]);
    };

    self.get = function STORAGE_get_from_localstorage(key) {
        if(self[key])
            return self[key];
        else // ProTip: getItem returns null (not undefined) if no item.
            return self[key] = JSON.parse(localStorage.getItem(key));
    };

    self.remove = function STORAGE_remove_from_localstorage(key, done) {
        self[key] = undefined;
        localStorage.removeItem(key);
    }

    return self;
});
