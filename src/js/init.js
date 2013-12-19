//RequireJS Configuration
(function initRequireConfig() {
    var libs = [
        'when', 'jquery', 'jfeed', 'moment',
        'underscore', 'uri', 'typeahead'
    ],
        modules = [
            'Config',
            'Runtime',
            'Renderer', 'SearchRenderer', 'MenuRenderer', 'DialsRenderer',
            'Search',
            'Storage',
            'Provider', 'TopsitesProvider', 'AppsProvider', 'WebappsProvider',
            'Dial', 'AppDial',
        ],
        dynamicPaths = {
            env: 'env',
            main: 'main',
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
window.rErrReport = function requireJSErrorReport(err) {
    log(err);
};

define(function initWINT(require) {

    //Using require to lazy-load main only after booster.

    var env = require('env'),
        config = require('Config'),
        runtime = require('Runtime');

    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : initWINT");

    runtime.promise.then(function(runtimeData) {
        ///Check if runtime exists (= Not first run) and check whether to use the "booster"
        var runtimeDataExists   = runtimeData,
            useBooster          = runtimeData.useBooster,
            BrandNewPage        = document.URL.indexOf('#newtab') === -1,
            NotOnBackgroundPage = document.URL.indexOf('background') === -1;


        if (runtimeDataExists && useBooster && BrandNewPage && NotOnBackgroundPage) {
            alert('STAHP');
            //Close & Open tab to move focus to the "main input"
            window.open("newtab.html#newtab"); // TODO: consider to use the chrome api to improve the speed of the new window opening
            window.close();
        } else {
            require(['main'], null);
        }
    }, alert);
});
