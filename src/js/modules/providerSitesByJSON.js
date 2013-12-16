"use strict";

define(['jquery', 'when', 'provider'], function($, when, provider) {
    return (function(module) {
        var self = Object.create(module);

        self.fetch = function fetchApps() {
            var def = when.defer(),
                inventory = [{
                    title: 'Gmail',
                    url: 'http://www.gmail.com',
                    icon: '/img/logo_icons/gmail175x175.jpg'
                }, {
                    title: 'Facebook',
                    url: 'http://www.facebook.com',
                    icon: '/img/logo_icons/facebook175x175.jpg'
                }, {
                    title: 'Twitter',
                    url: 'http://www.twitter.com',
                    icon: '/img/logo_icons/twitter175x175.jpg'
                }, {
                    title: 'Dropbox',
                    url: 'http://www.dropbox.com',
                    icon: '/img/logo_icons/dropbox175x175.jpg'
                }, {
                    title: 'Yahoo!',
                    url: 'http://www.yahoo.com',
                    icon: '/img/logo_icons/yahoo175x175.jpg'
                }, {
                    title: 'Amazon',
                    url: 'http://www.amazon.com',
                    icon: '/img/logo_icons/amazon175x175.jpg'
                }, {
                    title: 'Pinterest',
                    url: 'http://www.pinterest.com',
                    icon: '/img/logo_icons/pinterest175x175.jpg'
                }, {
                    title: 'Ebay',
                    url: 'http://www.ebay.com',
                    icon: '/img/logo_icons/ebay175x175.jpg'
                }, {
                    url: "http://www.lovedgames.com/games/ashes2ashes",
                    icon: "http://cdn.lovedgames.com/widgets/bg/1000/ashes2ashes_tumb.gif",
                    title: "Ashes 2 Ashes"
                }, {
                    url: "http://www.lovedgames.com/games/cloudyspil",
                    icon: "http://cdn.lovedgames.com/widgets/bg/1000/cloudy_tumb.gif",
                    title: "Cloudy"
                }];

            return def.promise;
        }

        return self;
    })(provider);
});
