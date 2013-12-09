define(['promise!async_config'], function boot(config) {
    var self = {useboosterq:false};

    if (config.config.booster_enabled && config.config.with_booster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1) {
        window.open("newtab.html#newtab");
        window.close();
        self.useboosterq = true;
    } else {}

    return self;
});
