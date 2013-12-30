define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true
    };

    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
