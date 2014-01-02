define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true
    };

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : env");
    }
    if (DEBUG && DEBUG.wipeLocalStorageOnStart) {
        localStorage.clear();
    }

    return settings;
});
