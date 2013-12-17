"use strict";

define(['jquery', 'when', 'provider', 'async_runtime', 'renderer'], function($, when, provider, runtime, renderer) {
    return (function(module) {
        var self = Object.create(module),
            parent = self.__proto__;
        $.extend(self, {
            name: "byJSON", // Used by the setIgnoreList mechanism to store the ignorelist at this self.name as key
            inventory: [],
            originalList: [],
            ignoreList: [],
        });

        //TODO: rewrite to go over ignoreList, not inventory.
        var checkInventory = function() {
            var newinventory = [];
            for (var i = 0; i < self.originalList.length; i++) {
                var item = self.originalList[i];
                if (!_.contains(self.ignoreList, item))
                    newinventory.push(item);
            }
            self.inventory = newinventory;
        }

        var remove = function(e) {
            var fadingout = parent.handlers.remove(e);
            fadingout.then(function() {
                //Can remove this line with this after HTML restructured (e=anchor):
                //var url = e.currentTarget.href;
                var $target = $(e.currentTarget).parents('.dial').eq(0),
                    url = $target.find('a').attr('href');
                self.addToIgnored(url);
                // No need to re-render for now.
                // renderer.dials('.page0', self);
            });
        }

        self.addToIgnored = function addToIgnored(url) {
            //throw "Must be overriden.";
            self.ignoreList.push(url);
            self.setIgnoreList();
            checkInventory();
        }

        self.fetch = function fetchApps() {
            var def = when.defer();
            runtime.promise.then(function(runtime) {
                self.originalList = runtime.data.dials.dials;
                self.inventory = [];
                _.each(self.originalList, function(item) {
                    var identfier = item.url;
                    if (!_.contains(self.ignoreList, identfier))
                        self.inventory.push($.extend(item, {
                            remove: self.handlers.remove,
                            click: self.handlers.click,
                            id: '',
                        }));
                })
                // No need to checkInventory() here, we filter them in the each;
                def.resolve(self.inventory);
            });
            return def.promise;
        }

        self.getIgnoreList()
        self.handlers = {
            remove: remove,
            click: parent.handlers.click,
        };

        return self;
    })(provider);
}, rErrReport);
