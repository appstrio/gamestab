define(['config'], function boot(config) {
    USE_BOOSTER = false;

    var useBooster = function() {
        return (config.config.booster_enabled && config.config.with_booster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1);
    };

    config.init(function(config) {
        if (useBooster()) {
            window.open("newtab.html#newtab");
            window.close();
            USE_BOOSTER = true;
        } else {}
    });
})
