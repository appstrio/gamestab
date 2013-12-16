"use strict";

define(['jquery', 'when', 'provider'], function($, when, provider) {
    return (function(module) {
        var self = Object.create(module);

        self.fetch = function fetchApps() {
            var def = when.defer(),
                inventory = [{
                    title  : 'Gmail',
                    id     : '',
                    url    : 'http://www.gmail.com',
                    icon   : '/img/logo_icons/gmail175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Facebook',
                    id     : '',
                    url    : 'http://www.facebook.com',
                    icon   : '/img/logo_icons/facebook175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Twitter',
                    id     : '',
                    url    : 'http://www.twitter.com',
                    icon   : '/img/logo_icons/twitter175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Dropbox',
                    id     : '',
                    url    : 'http://www.dropbox.com',
                    icon   : '/img/logo_icons/dropbox175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Yahoo!',
                    id     : '',
                    url    : 'http://www.yahoo.com',
                    icon   : '/img/logo_icons/yahoo175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Amazon',
                    id     : '',
                    url    : 'http://www.amazon.com',
                    icon   : '/img/logo_icons/amazon175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Pinterest',
                    id     : '',
                    url    : 'http://www.pinterest.com',
                    icon   : '/img/logo_icons/pinterest175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : 'Ebay',
                    id     : '',
                    url    : 'http://www.ebay.com',
                    icon   : '/img/logo_icons/ebay175x175.jpg',
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : "Ashes 2 Ashes",
                    id     : '',
                    url    : "http://www.lovedgames.com/games/ashes2ashes",
                    icon   : "http://cdn.lovedgames.com/widgets/bg/1000/ashes2ashes_tumb.gif",
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }, {
                    title  : "Cloudy",
                    id     : '',
                    url    : "http://www.lovedgames.com/games/cloudyspil",
                    icon   : "http://cdn.lovedgames.com/widgets/bg/1000/cloudy_tumb.gif",
                    click  : self.handlers.click,
                    remove : self.handlers.remove,
                }];
            self.inventory = inventory;
            def.resolve(inventory);
            return def.promise;
        }

        return self;
    })(provider);
}, rErrReport);
