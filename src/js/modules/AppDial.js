'use strict';

define(['jquery', 'renderer', 'Dial', 'when'], function($, renderer, Dial, when) {
    return function newAppDial(id, title, icon, description, options) {
        var parent = Dial('', title, icon, {
            setEventHandlers: false
        }),
            options = options || {},
            self = Object.create(parent);

        var init = function initDial() {
            var setEventHandlers = options.setEventHandlers || true;

            // check if passing object as first argument
            if (id && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    id: id,
                    url: '',
                    description: description
                    // No need for those, they get filled-in the prototype
                    // title : title,
                    // icon  : icon,
                });


            if (setEventHandlers)
                self.setEventHandlers();
        };

        self.setEventHandlers = function() {
            self.removing.then(function removeHandler(e) {
                e.stopPropagation();
                e.preventDefault();

                var $target = $(e.currentTarget).parents('.dial').eq(0);
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
            });

            self.launching.then(function launchHandler(e) {
                e.stopPropagation();
                e.preventDefault();
                chrome.management.launchApp(e.currentTarget.dataset.id, function() {});
            });
        };

        init();

        return self;
    };
});
