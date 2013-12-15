define(['jquery', 'when'], function($, when, provider) {

    var self = {
        handlers      : {},
        inventory     : [], //unfiltered
        filteredList  : [],
        ignored       : []
    };

    // TODO: Rewrite into custom "remove" event?
    self.removeHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.dial').eq(0);
        $target.fadeOut(function() {
            // self.topsites.getAndAddNewDial(function(err, newDial) {
            //     if (newDial) {
            //         _.defer(function() {
            //             self.renderDial(newDial);
            //         });

            //     }
            // });
        });
        // self.topsites.addToIgnored($target.data('url'));
    };

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
            click: self.clickHandler,
            remove: self.removeHandler
        }
    })();

    self.fetch = function fetchStuff() {

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
            }).
            catch (def.reject);
        return def.promise;
    };

    return self;
});
