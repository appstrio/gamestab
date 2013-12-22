'use strict';

define(['env', 'underscore', 'jquery', 'templates', 'when'], function Renderer(env, _, $, templates, when) {
    if (env.DEBUG && env.logLoadOrder) console.log('Loading Module : Renderer');
    var initting = when.defer(),
        self = {
            promise: initting.promise
        };

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

        self.$dialsSwitch = $('#dials-switch');
        self.$appsSwitch = $('#apps-switch');
        self.$androidSwitch = $('#android-switch');

        self.$dialsWrapper = $('#dials-wrapper');
        self.$appsWrapper = $('#apps-wrapper');
        self.$androidWrapper = $('#android-wrapper');

        setTimeout(function(){
            return initting.resolve();
        }, 0);
    };
    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    init();

    //If init fails handlers
    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
