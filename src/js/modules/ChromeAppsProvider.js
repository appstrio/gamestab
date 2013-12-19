"use strict";

define(['env', 'jquery', 'when', 'Provider', 'AppDial'], function ChromeAppsProvider(env, $, when, provider, AppDial) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : ChromeAppsProvider");
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
        }

        var isApp = function isApp(ExtensionInfo) {
            return ExtensionInfo.type === 'hosted_app' || ExtensionInfo.type === 'packaged_app' || ExtensionInfo.type === 'legacy_packaged_app';
        }

        self.fetch = function fetchApps() {
            var def = when.defer();
            chrome.management.getAll(function(rawDials) {
                for (var i = 0; i < rawDials.length; i++) {
                    var raw = rawDials[i];
                    if (isApp(raw))
                        self.dials.push(AppDial(raw.id, raw.shortName, raw.icons.last().url, raw.description));
                };
                def.resolve(self.dials);
            });

            return def.promise;
        };
        self.removeDialFromList = function(dial) {
            var removing = when.defer();

            chrome.management.uninstall(dial.chromeId, {
                showConfirmDialog: true
            }, function() {
                findApp(dial.chromeId).then(removing.reject).otherwise(removing.resolve);
            });
            return removing.promise;
        }

        var findApp = function(id) {
            var finding = when.defer();
            chrome.management.getAll(function(apps) {
                apps = apps || [];
                var found = _.findWhere(apps, {
                    id: id
                });
                if (!found) finding.reject();
                else finding.resolve();
            });
            return finding.promise;
        }

        initting.promise.
        catch (self.errorLoading);

        //Init after dependencies have loaded;
        init();

        return self;
    })(provider);

}, rErrReport);
