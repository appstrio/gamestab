"use strict";
define(['jquery', 'when', 'renderer', 'underscore', 'storage'], function($, when, renderer, _, storage) {

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
    self.getDialList = function() { this.dials = storage.get(this.name); };
    self.setDialList = function() {storage.set(this.name, this.dials); };

    return self;

}, rErrReport);
