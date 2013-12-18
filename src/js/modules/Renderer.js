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
    self.init = function initModule(options) {

        // setup the general layout
        self.$wrapper = $('#wrapper');
        self.$layout = $(templates['classic']()); // NOTE: Used inside searchRenderer;

        // setup general layout
        self.$wrapper.html(self.$layout);

        self.$dialsSwitch = $('#dials-switch');
        self.$appsSwitch = $('#apps-switch');

        self.$dialsWrapper = $('#dials-wrapper');
        self.$appsWrapper = $('#apps-wrapper');

        return initting.resolve();
    };
    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    //If init fails handlers
    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
