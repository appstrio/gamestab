require.config({
    baseUrl: 'js/',
    waitSeconds: 30,
    paths: {
        promise: 'libs/requirejs-promise',
        underscore: 'libs/underscore-min',
        jquery: 'libs/jquery.min',
        uri: 'libs/uri.min',
        moment: 'libs/moment.min',
        env: 'env',
        templates: 'templates',
        async_chromeapps: 'modules/async_chromeapps',
        async_config: 'modules/async_config',
        async_screenshot: 'modules/async_screenshot',
        async_runtime: 'modules/async_runtime',
        async_topsites: 'modules/async_topsites',
        locator: 'modules/locator',
        analytics: 'modules/analytics',
        thumbly: 'modules/thumbly',
        classiclauncher: 'modules/classiclauncher',
        async_filesystem: 'modules/async_filesystem',
        launcher: 'modules/launcher',
        news: 'modules/news',
        renderer: 'modules/renderer',
        search: 'modules/search',
        storage: 'modules/storage',
        weather: 'modules/weather'
    }
});

window.log = function log() {
    this.count = 0;
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i],
            obj;
        if (typeof arg === 'object')
            obj = JSON.stringify(arg);
        else
            obj = arg;

        console.log("LOG " + this.count + "#:" + obj)
    };
}

define(function(require) {
    // Using requirejs' require to specify loading order

    var async_config = require('modules/async_config'),
        renderer = require('modules/renderer');
    //Load config
    async_config.then(function InitOrRunBooster(data) { // TODO: @hlandao Why booster_enabled and with_booster?
        //Check whether we want to use the "booster"
        if (data.booster_enabled && data.with_booster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1) {
            //Close & Open tab to move focus to the "main input"
            window.open("newtab.html#newtab");
            window.close();
            self.useboosterq = true;
        } else {
            (function renderNewTab() {
                renderer.render();
                // require everything else
                // require('modules/analytics');
                // TODO when is this called?
                // setTimeout(function boost() {
                //     chrome.tabs.getCurrent(function(tab) {
                //         chrome.tabs.update(tab.id, {
                //             selected: true
                //         }, function() {
                //             $('.search-input').blur().focus();
                //         });
                //     });
                // },0);
            })()
        }
    })
});
