define(['jquery', 'when','provider'], function($, when, provider) {
    return (function(self) {

        var isApp = function isApp(ExtensionInfo) {
            return ExtensionInfo.type === 'hosted_app' || ExtensionInfo.type === 'packaged_app' || ExtensionInfo.type === 'legacy_packaged_app';
        }

        self.clickHandler = function(e) {
            e.stopPropagation();
            e.preventDefault();
            chrome.management.launchApp(e.currentTarget['data-id'], function() {});
        };

        self.removeHandler = function(e) {
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
            var def = when.defer();
            chrome.management.getAll(function(stuff) {
                for (var i = stuff.length - 1; i >= 0; i--) {
                    if (isApp(stuffObject))
                        self.inventory.push({
                            id          : stuffObject.id,
                            title       : stuffObject.shortName,
                            name        : stuffObject.shortName,
                            icon        : stuffObject.icons.last().url,
                            description : stuffObject.description,
                            click       : self.handlers.click,
                            remove      : self.handlers.remove
                        });
                };
                def.resolve(self.inventory);
            });

            return def.promise;
        }

        return self;
    })(provider);
});
