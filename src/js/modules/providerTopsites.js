"use strict";

define(['jquery', 'when', 'provider'], function($, when, provider) {
    return (function(module) {
        var self = Object.create(module);
        $.extend(self, {
            inventory: [],
            filteredList: [],
            ignored: []
        });

        self.fetch = function fetchTopsites() {
            var def = when.defer(),
                inventory = [];
            chrome.topSites.get(function(stuff) {
                console.log("hello");
                for (var i = stuff.length - 1; i >= 0; i--) {
                    var stuffObject = stuff[i];
                    inventory.unshift({
                        id: '', // To be consistent with the mixed app/topsites-dot file.
                        url: stuffObject.url,
                        title: stuffObject.title,
                        icon: stuffObject.icon,
                        click: self.handlers.click,
                        remove: self.handlers.remove
                    });
                };
                // if (dial.screenshotDefer && dial.screenshotDefer.promise) {
                //     dial.screenshotDefer.promise().done(function () {
                //         //css('background-image', 'url(' + dial.screenshot + ')');
                //     });
                // }
                self.inventory = inventory;
                def.resolve(inventory);
            });

            return def.promise;
        }

        self.provide = function(type) {
            var def = new when.defer(),
                fetching = self.fetch().then(function(fullList) {
                    // var diffArr = _.reject(_topsites, function(site) {
                    //     if (_.findWhere(self.topsites, {
                    //         url: site.url
                    //     })) return true;
                    //     if (self.ignoreList.indexOf(site.url) > -1) return true;
                    //     return false;
                    // });
                    def.resolve(fullList);
                }).catch(def.reject);
            return def.promise;
        };

        return self;
    })(provider);

}, rErrReport);