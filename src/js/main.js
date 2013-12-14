require.config({
    baseUrl: 'js/',
    paths: {
        underscore       : 'libs/underscore-min',
        jquery           : 'libs/jquery.min',
        uri              : 'libs/uri.min',
        moment           : 'libs/moment.min',
        typeahead        : 'libs/typeahead_modified',
        env              : 'env',
        templates        : 'templates',
        async_chromeapps : 'modules/async_chromeapps',
        async_config     : 'modules/async_config',
        async_screenshot : 'modules/async_screenshot',
        async_runtime    : 'modules/async_runtime',
        async_topsites   : 'modules/async_topsites',
        dpTopsitesApps   : 'modules/dpTopsitesApps',
        locator          : 'modules/locator',
        analytics        : 'modules/analytics',
        thumbly          : 'modules/thumbly',
        classiclauncher  : 'modules/classiclauncher',
        async_filesystem : 'modules/async_filesystem',
        launcher         : 'modules/launcher',
        news             : 'modules/news',
        renderer         : 'modules/renderer',
        search           : 'modules/search',
        storage          : 'modules/storage',
        weather          : 'modules/weather'
    }
});

Array.prototype.last = function() {return this[this.length-1];} // ProTip: Will fail miserably if this.length == 0;

window.log = function log() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i],
            obj;
        if (typeof arg === 'object')
            obj = JSON.stringify(arg, null, 2);
        else
            obj = arg;

        console.log("LOG " + 0 + "#:" + obj)
    };
};

define(function(require) {
    // Using requirejs' require to specify loading order

    //Load config, and then
    require('async_runtime').then(function InitOrRunBooster(runtime) {
        //Check whether we want to use the "booster"
        if (runtime.useBooster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1) {
            //Close & Open tab to move focus to the "main input"
            window.open("newtab.html#newtab"); // TODO: consider to use the hrome api to improve the speed of the new window opening
            window.close();
        } else {
            setTimeout(function boost() {
                    chrome.tabs.getCurrent(function(tab) {
                        chrome.tabs.update(tab.id, {
                            selected: true
                        }, function() {
                            $('.search-input').blur().focus();
                        });
                    });
                },0);
            (function renderNewTab() {
                var dialprovider = require('dpTopsitesApps'),
                    renderer = require('renderer');
                require('search');
                dialprovider.provide("topsites").then(renderer.renderDials);
                dialprovider.provide("apps").then(renderer.renderApps);
                // require everything else
                // require('modules/analytics');
            })();
        };
    });
});
