define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true,
        // Global Error handler
        errhandler: function defaultErrorHandler(err) {
            if(window.DEBUG) {
                log(err);
            } else {
                console.log('Error loading, try to refersh or re-install the app.');
            }
        },
    };
    settings.DEBUG = settings.type === "development";

    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
