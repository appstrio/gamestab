define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true
    };

    if (DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
