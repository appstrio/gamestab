"use strict";

define(['jquery', 'when', 'renderer', 'underscore', 'storage'], function providerBASE($, when, renderer, _, storage) {

    var self = {
        name: "providerBASE", // Must be overriden in child objects - Used to throw an error if not overriden.
        handlers: {},
        dials: [],
    };

    // TODO: Rewrite into custom "remove" event?
    self.handlers.remove = function removeHandler(e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.dial').eq(0),
            removingDial = renderer.removeDialElement($target);

        return removingDial;
    };

    self.handlers.click = function clickHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        //Can remove this line with this after HTML restructured (e=anchor):
        //var url = e.currentTarget.href;
        var url = $(e.currentTarget).find('a').attr('href');

        // if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
        //     window.location.href = url;
        // });

        setTimeout(function() {
            window.location.href = url;
        }, 500);
    };


    self.provide = function(type) { return this.fetch(); };

    self.fetch = function fetchStuff() {throw "Must be overriden."; }
    self.getDialList = function() {
        var def = when.defer(),
            tmp = storage.get(this.name);
        if(tmp) def.resolve(this.dials = tmp)
        else def.reject(null);
    };
    self.setDialList = function() {storage.set(this.name, this.dials); };

    return self;

}, rErrReport);
