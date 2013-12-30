// document.title = chrome.i18n.getMessage("appName");

require.config({
    "baseUrl": "js/",
    "paths": {
        "when"                : "libs/when",
        "jquery"              : "libs/jquery",
        "jfeed"               : "libs/jfeed",
        "moment"              : "libs/moment",
        "underscore"          : "libs/underscore",
        "uri"                 : "libs/uri",
        "typeahead"           : "libs/typeahead",

        "Config"              : "modules/Config",
        "Runtime"             : "modules/Runtime",

        "Wintbar"             : "modules/Wintbar",
        "Storage"             : "modules/Storage",
        "Provider"            : "modules/Provider",
        "AndroIt"        : "modules/AndroIt",

        "Renderer"       : "modules/Renderer",
        "MenuRenderer"   : "modules/MenuRenderer",
        "DialsRenderer"  : "modules/DialsRenderer",

        "Dial"           : "modules/Dial",
        "AppDial"        : "modules/AppDial",
        "AndroidDial"    : "modules/AndroidDial",

        "Overlay"          : "modules/UI/Overlay",
        "AdderOverlay"     : "modules/UI/AdderOverlay",
        "AndroidOverlay"   : "modules/UI/AndroidOverlay",

        // "JSONProvider"             : "modules/JSONProvider",
        "TopsitesProvider"          : "modules/TopsitesProvider",
        "ChromeAppsProvider"        : "modules/ChromeAppsProvider",
        "WebAppsListProvider"       : "modules/WebAppsListProvider",
        "JSONProviderFactory"       : "modules/JSONProviderFactory",
        "StoredDialsProvider"       : "modules/StoredDialsProvider",
        "AndroidAppsListProvider"   : "modules/AndroidAppsListProvider",
        "LovedGamesGamesProvider"   :  "modules/LovedGamesGamesProvider",
        "sitesProvider"             :  "modules/sitesProvider",
        "defaultByCountryProvider" :  "modules/defaultByCountryProvider",

        "Alert"                     : "modules/UI/Alert",

        "env": "env",
        "main": "main",
        "templates": "templates"
    },
    "shim": {
        "underscore": {
            "exports": "_"
        }
    }
});

define(function initWINT(require) {
    // Using require to lazy-load main only after booster.

    require("env");
    var config = require("Config");

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : initWINT");
    }
    if (DEBUG && DEBUG.wipeLocalStorageOnStart) {
        localStorage.clear();
    }

    config.promise.then(function(configData) {
        ///Check if runtime exists (= Not first run) and check whether to use the "booster"
        var useBooster = configData && configData.runtime && configData.runtime.useBooster,
            BrandNewPage = document.URL.indexOf("#newtab") === -1,
            NotOnBackgroundPage = document.URL.indexOf("background") === -1;

        if (useBooster && BrandNewPage && NotOnBackgroundPage) {
            //Close & Open tab to move focus to the "main input"
            chrome.tabs.create({
                url: "newtab.html#newtab"
            });
            //window.open("newtab.html#newtab");
            // TODO: consider to use the chrome api to improve the speed of the new window opening
            window.close();
        } else {
            require(["main"], null);
        }
    });
});
