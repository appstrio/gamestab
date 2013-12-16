"use strict";
define(['jquery', 'when'], function($, when) {

    var self = {
        handlers: {},
        // inventory     : [],
        // filteredList  : [],
        // ignored       : []
    };

    // TODO: Rewrite into custom "remove" event?
    self.handlers.remove = function removeHandler(e) {
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

    self.handlers.click = function clickHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
        //     window.location.href = url;
        // });

        setTimeout(function() {
            window.location.href = e.currentTarget.dataset.url;
        }, 500);
    };

    self.init = (function init() {
        self.handlers = {
            click: self.clickHandler,
            remove: self.removeHandler
        }
    })();

    self.fetch = function fetchStuff() {
        throw "Fetch is not implemented on provider.js"
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

    // self.fetch = function fetchStuff() { return [] }

    return self;

}, rErrReport);