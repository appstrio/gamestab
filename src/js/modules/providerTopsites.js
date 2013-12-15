define(['jquery', 'when'], function($, when, provider) {
    return (function(module) {

        var self = {
            handlers: {}
        },
            inventory    = [], //unfiltered
            filteredList = [],
            ignored      = []

        self.clickHandler = function(e) {
            e.stopPropagation();

            // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
            //     window.location.href = url;
            // });

            setTimeout(function() {
                window.location.href = e.currentTarget["data-url"];
            }, 500);
        };


        self.init = (function init() {
            self.handlers = {
                click  : self.clickHandler,
                remove : self.removeHandler
            }
        })();

        self.fetch = function fetchTopsites() {
            var def = when.defer();
            chrome.topSites.get(function(stuff) {
                for (var i = stuff.length - 1; i >= 0; i--) {
                    var stuffObject = stuff[i];
                    inventory.push({
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
});
