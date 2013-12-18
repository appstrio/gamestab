"use strict";

define(function Renderer(require) {
    var when      = require('when');
    var initting = when.defer(),
        self = {
            // name: "renderer" TODO needed?
            promise: initting.promise,
            settings: {},
            // subs: {} // TODO uncomment if need to use submodules beyond renderer;
        },
        defaultSettings = {},
        // TODO do it like this, or at the top of the file?
        _         = require('underscore'),
        $         = require('jquery'),
        templates = require('templates'),
        when      = require('when');
    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    var init = function initModule(options) {

        // setup the general layout
        self.$wrapper = $('#wrapper');
        self.$layout = $(templates['classic']()); // NOTE: Used inside searchRenderer;

        // setup general layout
        self.$wrapper.html(self.$layout);

        //Renderer Submodules self.init() -> just require them

        var subs = {
            search: require('rendererSearch'),
            menu: require('rendererMenu'),
            dials: require('rendererDials'),
        };
        // setTimeout(function asyncInit () {
        subs.search.init();
        subs.menu.init();
        subs.dials.init();
        // },0);
        // self.subs = subs;

        subs.search.promise.then(subs.search.focuswOnSearch);

        when.all([
             subs.search.promise,
             subs.menu.promise,
             subs.dials.promise
        ]).then(initting.resolve).catch(initting.reject);
    };
    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    //Init after dependencies have loaded;
    init();

    //If init fails handlers
    initting.promise.catch (errorLoading);
    return self;

}, rErrReport);
