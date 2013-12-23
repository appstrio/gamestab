define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true,
        logLoadOrder                  : false,
        exposeModules                 : false,
        forceRefreshRuntimeData       : false,
        forceRefreshConfigData        : false,
        JSONProviderForceLoadFromJSON : false,
        errhandler: function defaultErrorHandler(err) {
            log(err);
            console.log('Error loading, try to refersh or re-install the app.');
        },
    };
    settings.DEBUG = settings.type === "development";

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
