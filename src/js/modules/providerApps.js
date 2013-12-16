"use strict";

define(['jquery', 'when','provider'], function($, when, provider) {
    return (function(module) {
        var self = Object.create(module);

        var isApp = function isApp(ExtensionInfo) {
            return ExtensionInfo.type === 'hosted_app' || ExtensionInfo.type === 'packaged_app' || ExtensionInfo.type === 'legacy_packaged_app';
        }

        self.handlers.click = function(e) {
            e.stopPropagation();
            e.preventDefault();
            chrome.management.launchApp(e.currentTarget.dataset.id, function() {});
        };

        self.handlers.remove = function(e) {
            e.stopPropagation();
            e.preventDefault();
            var $target = $(e.currentTarget).parents('.app').eq(0);
            var id = $target.data('id');
            chrome.management.uninstall(id, {
                showConfirmDialog: true
            }, function() {
                chrome.management.getAll(function(apps) {
                    apps = apps || [];
                    var found = _.findWhere(apps, {
                        id: id
                    });
                    if (!found) {
                        $target.fadeOut();
                    }
                });
            });
        };

        self.fetch = function fetchApps() {
            var def = when.defer(),
                inventory = [];
            chrome.management.getAll(function(stuff) {
                for (var i = stuff.length - 1; i >= 0; i--) {
                    var stuffObject = stuff[i];
                    if (isApp(stuffObject))
                        inventory.push({
                            id          : stuffObject.id,
                            title       : stuffObject.shortName,
                            url         : '',
                            icon        : stuffObject.icons.last().url,
                            description : stuffObject.description,
                            click       : self.handlers.click,
                            remove      : self.handlers.remove
                        });
                };
                self.inventory = inventory;
                def.resolve(inventory);
            });

            return def.promise;
        }

        return self;
    })(provider);

}, rErrReport);