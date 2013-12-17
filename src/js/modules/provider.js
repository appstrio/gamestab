"use strict";
define(['jquery', 'when', 'renderer', 'underscore', 'storage'], function($, when, renderer, underscore, storage) {

    var self = {
        name: "providerBASE", // Must be overriden in child objects - Used to throw an error if not overriden.
        handlers: {},
        inventory: null,
        filteredList: null,
        ignoreList: null,
    };

    // TODO: Rewrite into custom "remove" event?
    self.handlers.remove = function removeHandler(e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.dial').eq(0),
            def = when.defer();

        this.addToIgnored(e.currentTarget.dataset.url);

        $target.fadeOut(def.resolve);
        //TODO : providerSitesByJSON / topsites specific code
        def.then(function() {
            renderer.dials('.page0', this);
        });

        return def.promise;
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


    self.provide = function(type) {
        var def = new when.defer();
        var fetching = this.fetch();
        fetching.then(function(fullList) {
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

    self.fetch = function fetchStuff() {
        throw "Must be overriden.";
    }
    self.addToIgnored = function addToIgnored(identifier) {
        //throw "Must be overriden.";
        _.each(ignoreList, function(candidateIdentifier) {
            var found = _.findWhere(topsites, {
                url: url
            });
            if (found) {
                topsites.remove(found);
            }
        });
    }
    self.getIgnoreList = function() {
        this.ignoreList = storage.get(this.name);
    };
    self.setIgnoreList = function() {
        storage.set(this.name, this.ignoreList);
    };

    //Some init method {
    // if (DEBUG && this.name === "providerBASE") throw "Must give child-provider.js a name!";
    // }

    return self;

}, rErrReport);
