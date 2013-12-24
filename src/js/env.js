define(function env() {
    var settings = {
        type                          : "development",
        booster                       : true,
        // Global Error handler
        errhandler: function defaultErrorHandler(e) {
            if(typeof e === "string")
                alert(e)
            else
                if(window.DEBUG) {
                    log(e);
                } else {
                    console.log('Error loading, try to refersh or re-install the app.');
                }
        },
    };

    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : env");

    return settings;
});
