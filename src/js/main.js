"use strict";
window.DEBUG = window.DEBUG || true;

//Helper functions
window.log = function log() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i],
            obj;
        if (typeof arg === 'object')
            obj = JSON.stringify(arg, null, 2);
        else
            obj = arg;

        console.log("LOG " + i + "#:" + obj)
    };
};



Array.prototype.last = function() { return this.length && this[this.length - 1]; }; // ProTip: Will fail miserably if this.length == 0;


window.rErrReport = function requireJSErrorReport (err) { log(err); };
//RequireJS Configuration
(function initRequireConfig() {
    var libs = [
        'when',
        'jquery',
        'jfeed',
        'moment',
        'underscore',
        'uri',
        'typeahead'
    ],
    modules = [
        'async_config',
        'async_runtime',
        'async_chromeapps',
        'async_screenshot',
        'locator',
        'analytics',
        'thumbly',
        'classiclauncher',
        'async_filesystem',
        'launcher',
        'news',
        'renderer',
        'search',
        'storage',
        'weather',
        'provider',
        'providerTopsites',
        'providerApps',
        'providerSitesByJSON',
    ],
    dynamicPaths = {
        env: 'env',
        templates: 'templates'
    };

    while (modules.length) {
        var currentModule = modules.pop();
        dynamicPaths[currentModule] = 'modules/' + currentModule;
    }
    while (libs.length) {
        var currentLib = libs.pop();
        dynamicPaths[currentLib] = 'libs/' + currentLib;
    }
    //log(dynamicPaths);
    require.config({
        baseUrl: 'js/',
        paths: dynamicPaths
    });
})();

define(function(require) {
    // Using requirejs' require to specify loading order

    //Load config, and then
    require('async_runtime').then(function InitOrRunBooster(runtimeModule) {
        var runtimeData = runtimeModule.runtime;
        //Check whether we want to use the "booster"
        if (async_config.data.runtime.useBooster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1) {
            //Close & Open tab to move focus to the "main input"
            window.open("newtab.html#newtab"); // TODO: consider to use the chrome api to improve the speed of the new window opening
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
            }, 0);
            (function renderNewTab() {
                var renderer = require('renderer'),
                    sites = require('providerSitesByJSON'),
                    apps = require('providerApps')

                require('search');

                renderer
                    .dials('.page0', sites)
                    .dials('.page1', apps)
            })();
        };
    });
}, rErrReport);
