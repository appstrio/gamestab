define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true,
        // DEBUG Options
        logLoadOrder                  : false,
        exposeModules                 : false,
        forceRefreshRuntimeData       : false,
        forceRefreshConfigData        : false,
        JSONProviderForceLoadFromJSON : false,
        wipeLocalStorageOnStart       : false,
        // Global Error handler
        errhandler: function defaultErrorHandler(err) {
            log(err);
            console.log('Error loading, try to refersh or re-install the app.');
        },
    };
    settings.DEBUG = settings.type === "development";

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
