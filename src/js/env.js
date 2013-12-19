define(function env() {
    var settings = {
        type               : "development",
        booster            : true,
        loadConfigFromFile : false,
        logLoadOrder       : true,
        errhandler: function defaultErrorHandler(err) {
            log(err);
            console.log('Error loading, try to refersh or re-install the app.');
        },
    };
    settings.DEBUG = settings.type === "development";

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
