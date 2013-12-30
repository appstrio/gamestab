define(["env", "jquery", "when", "Provider", "AppDial", "Alert", "underscore"], function ChromeAppsProvider(env, $, when, provider, AppDial, Alert, _) {
    "use strict";

    if (window.DEBUG && window.DEBUG.logLoadOrder) {
        console.log("Loading Module : ChromeAppsProvider");
    }
    return (function(parent) {
        var initting = when.defer(),
            self = Object.create(parent);
        // defaultSettings = {};

        var init = function initModule() {
            $.extend(self, {
                promise: initting.promise,
                dials: [],
                // settings : $.extend(defaultSettings, options),
            });

            var fetching = self.fetch();
            fetching.then(initting.resolve);
        };

        var isApp = function isApp(ExtensionInfo) {
            return ExtensionInfo.type === "hosted_app" || ExtensionInfo.type === "packaged_app" || ExtensionInfo.type === "legacy_packaged_app";
        };

        self.fetch = function fetchApps() {
            var def = when.defer();
            chrome.management.getAll(function(rawDials) {
                for (var i = 0; i < rawDials.length; i += 1) {
                    var raw = rawDials[i];
                    if (isApp(raw))
                        self.dials.push(AppDial(raw.id, raw.shortName, raw.icons.last().url, raw.description));
                }
                def.resolve(self.dials);
            });

            return def.promise;
        };
        self.removeDialFromList = function(dial) {
            var def = when.defer(),
                removing = def.promise;

            chrome.management.uninstall(dial.chromeId, {
                showConfirmDialog: true
            }, function confirmIfDeletionOccured() {
                findApp(dial.chromeId).then(def.reject).otherwise(def.resolve);
            });

            removing.done(function showAlert() {
                Alert.show("Bye bye " + dial.title + ", You've been removed.");
            });

            return removing;
        };

        var findApp = function(id) {
            var finding = when.defer();
            chrome.management.getAll(function(apps) {
                apps = apps || [];
                var found = _.findWhere(apps, {
                    id: id
                });
                if (!found) {
                    finding.reject();
                } else {
                    finding.resolve();
                }
            });
            return finding.promise;
        };

        init();

        return self;
    })(provider);
});
