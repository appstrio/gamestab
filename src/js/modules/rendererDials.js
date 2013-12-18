"use strict";

define(function dialsRenderer(require) {
    var when      = require('when');
    var initting = when.defer(),
        self = {
            // name: "dials"
            promise: initting.promise,
            // settings: {},
            providers: {},
        },
        // defaultSettings = {},
        // Dependencies using require() method because we might want to require different providers at runtime in initModule
        _         = require('underscore'),
        $         = require('jquery'),
        templates = require('templates');
    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    self.init = function initModule(options) {

        // widely used dom selectors
        self.$webAppsOverlayBtn = $('.web-apps-overlay-btn');
        self.$fadescreen = $('#overlays');

        // Require providers, Fill wrappers with dials
        var webApps = require('providerWebApps'),
            apps = require('providerApps');

        // self.providers = {
        //     dials:webApps,
        //     apps:apps,
        // };

        webApps.promise.then(function (dials) { self.renderDialsArr(dials, '#dialsWrapper', {maxDials : 18}); });
        apps.promise.then(function (apps) { self.renderDialsArr(apps, '.dialsWrapper'); });

        setEventHandlers();
        when.all([webApps.promise,apps.promise], initting.resolve , initting.reject)
    };
    /**
     * @param options {maxDials: number}
     */
    self.renderDialsArr = function renderDials(dials, parentSelector, options) {
        var $parent = $(parentSelector), options = options || {};
        //Clean dials zone
        $parent.html('');

        var maxDials = options.maxDials || dials.length;
        for (var i = 0; i < dials.length && i < maxDials; i++) {
            var dial = dials[i];
            self.renderDial($parent, dial);
        };

        return self;
    }

    self.renderDial = function($parent, dial) {
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click)
            .on('click', '.dial-remove-button', dial.remove);

        if (dial.id)
            $dial.data('id', dial.id);

        return $parent.append($dial);
    };

    self.removeDialElement = function($ele) {
        var removing = when.defer();
        $ele.fadeOut(removing.resolve);
        return removing.promise;
    }

    var openOverlayHandler = function function_name(name) {
            return function() {
                //Show only the selected page
                _.each(self.overlays, function($ol) {$ol.hide()});
                self.$fadescreen.removeClass('hide');
                self.$fadescreen.fadeIn();
                console.log('self.overlays[name]',self.overlays[name]);
                self.overlays[name].show();
            }
    };

    var closeOverlayHandler = function function_name() {
        _.each(self.overlays, function($ol) {$ol.hide()});
        self.$fadescreen.fadeOut(function(){
            self.$fadescreen.addClass('hide');
        });
    }

    var setEventHandlers = function () {
        self.$webAppsOverlayBtn.on ('click', openOverlayHandler('$webAppsOverlay'));
        self.$fadescreen.on ('click', closeOverlayHandler);
    }

    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    //Init after dependencies have loaded;
    // Letting main.js init renderer
    // init();
    //If init fails handlers
    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
