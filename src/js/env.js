define(function env() {
    var settings = {
        type               : "development",
        booster            : true,
        loadConfigFromFile : false,
        logLoadOrder       : true,
    };
    settings.DEBUG = settings.type === "development";

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
