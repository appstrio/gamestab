// document.title = chrome.i18n.getMessage("appName");

require.config({
    "baseUrl": "js/",
    "paths": {
        "when"       : "libs/when",
        "jquery"     : "libs/jquery",
        "jfeed"      : "libs/jfeed",
        "moment"     : "libs/moment",
        "underscore" : "libs/underscore",
        "uri"        : "libs/uri",
        "typeahead"  : "libs/typeahead",

        "Config"     : "modules/Config",
        "Analytics"  : "modules/Analytics",
        "Runtime"    : "modules/Runtime",
        "Wintbar"    : "modules/Wintbar",
        "Storage"    : "modules/Storage",
        "AndroIt"    : "modules/AndroIt",
        "Utils"      : "modules/Utils",

        "Renderer"      : "modules/Renderer",
        "MenuRenderer"  : "modules/MenuRenderer",
        "DialsRenderer" : "modules/DialsRenderer",

        "Dial"        : "modules/Dial",
        "AppDial"     : "modules/AppDial",
        "AndroidDial" : "modules/AndroidDial",

        // "JSONProvider"             : "modules/JSONProvider",
        "Provider"                 : "modules/Providers/Provider",
        "TopsitesProvider"         : "modules/Providers/TopsitesProvider",
        "ChromeAppsProvider"       : "modules/Providers/ChromeAppsProvider",
        "WebAppsListProvider"      : "modules/Providers/WebAppsListProvider",
        "JSONProviderFactory"      : "modules/Providers/JSONProviderFactory",
        "StoredDialsProvider"      : "modules/Providers/StoredDialsProvider",
        "AndroidAppsListProvider"  : "modules/Providers/AndroidAppsListProvider",
        "LovedGamesGamesProvider"  : "modules/Providers/LovedGamesGamesProvider",
        "sitesProvider"            : "modules/Providers/SitesProvider",
        "defaultByCountryProvider" : "modules/Providers/DefaultByCountryProvider",

        "Alert"          : "modules/UI/Alert",
        "Overlay"        : "modules/UI/Overlay",
        "AdderOverlay"   : "modules/UI/AdderOverlay",
        "AndroidOverlay" : "modules/UI/AndroidOverlay",

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

    config.promise.then(function(configData) {
        ///Check if runtime exists (= Not first run) and check whether to use the "booster"
        // TODO: remove configData && configData.runtime checks - they're redundant
        var useBooster = configData && configData.runtime && configData.runtime.useBooster && !configData.runtime.fromChromeWebstore,
            BrandNewPage = document.URL.indexOf("#newtab") === -1,
            NotOnBackgroundPage = document.URL.indexOf("background") === -1,
            isChromeApp = window.isChromeApp;

        if(!isChromeApp){
            $("title").text("Games Tab!"); //TODO: hard coded
        }else{
            $("title").text("New Tab"); //TODO: hard coded
        }

        if ((DEBUG && DEBUG.forceBooster) ||
            BrandNewPage && isChromeApp && useBooster && NotOnBackgroundPage) {
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
