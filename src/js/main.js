"use strict";

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
        'config',
        'runtime',
        'rendererSearch',
        'rendererMenu',
        'rendererDials',
        'renderer',
        'search',
        'storage',
        'provider',
        'providerTopsites',
        'providerApps',
        'providerWebApps',
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
        paths: dynamicPaths,
        shim: {
            underscore: {
                exports: '_'
            },
        }
    });
})();

define(function(require) {
    // Using requirejs' require to specify loading order

    //Load config, and then
    var config = require('config');
    config.promise.then(function(configData){

        ///Check if runtime exists (= Not first run) and check whether to use the "booster"
        if ( configData.runtime
             && configData.runtime.useBooster
             && document.URL.indexOf('#newtab') === -1
             && document.URL.indexOf('background') === -1) {

            //Close & Open tab to move focus to the "main input"
            window.open("newtab.html#newtab"); // TODO: consider to use the chrome api to improve the speed of the new window opening
            window.close();
        } else {
            //Make sure `input` has been rendered with the timeout, then make it focused
            var runtime = require('runtime'),
                Renderer = require('renderer'),
                renderInitting = Renderer.init();
            renderInitting.then(function () {
                var SearchRenderer = require('rendererSearch'),
                    MenuRenderer = require('rendererMenu'),
                    DialsRenderer = require('rendererDials'),
                    SearchRendererInitting = SearchRenderer.init(),
                    MenuRendererInitting = MenuRenderer.init(),
                    DialsRendererInitting = DialsRenderer.init();

                SearchRendererInitting.then(SearchRenderer.focusOnSearch);
            })
            setTimeout(function boost() {
                // $('.page1 .dial .dial-remove-button').eq(0).click();
            },0);
        }
    }, rErrReport);
}, window.rErrReport);

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
Array.prototype.last = function() { return this.length && this[this.length - 1]; };
window.rErrReport = function requireJSErrorReport (err) { log(err); };
