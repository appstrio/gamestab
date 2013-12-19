"use strict";


define(['env', 'underscore', 'jquery', 'Renderer', 'templates', 'WebappsProvider', 'AppsProvider'], function DialsRenderer(env, _ , $ , renderer , templates, webApps, apps) {
    if(env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialsRenderer");
    var when      = require('when');
    var initting = when.defer(),
        self = {
            // name: "dials"
            promise: initting.promise,
            // settings: {},
            providers: {},
        };
        // defaultSettings = {},
    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    var init = function initModule(options) {

        // widely used dom selectors
        self.$webAppsOverlayBtn = $('.web-apps-overlay-btn');
        self.$fadescreen = $('#overlays');

        // Fetch existing dials
        webApps.promise.then(function (dials) {
            self.renderDialsArr(dials, renderer.$dialsWrapper, {maxDials : 18});
        });
        apps.promise.then(function (apps) {
            self.renderDialsArr(apps, renderer.$appsWrapper);
        });

        //TODO hardcoded
        $("#dials-wrapper").show();

        setEventHandlers();

        return when.all([webApps.promise,apps.promise], initting.resolve , initting.reject);
    };
    /**
     * @param options {maxDials: number}
     */
    self.renderDialsArr = function renderDials(dials, $parent, options) {
        var options = options || {};
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
            .on('click', dial.launch)
            .on('click', '.dial-remove-button', dial.remove);

        self.setDialEventHandlers(dial);

        if (dial.id)
            $dial.data('id', dial.id);

        return $parent.append($dial);
    };

    self.setDialEventHandlers = function (dial) {
        return dial.removing.then(self.renderDialRemoval);
    }

    self.renderDialRemoval = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var removing = when.defer(),
            $ele =  $(e.currentTarget).parents('.dial').eq(0);
        $ele.fadeOut(removing.resolve);

        return false;
    }

    self.addDial = function () {
        // render new dial
        // add dial to runtime.dials and save that
        //
    }

    var openOverlayHandler = function function_name(name) {
            return function() {
                //Show only the selected page
                $('.overlay').hide();
                self.$fadescreen.removeClass('hide');
                self.$fadescreen.fadeIn();
                // console.log('self.overlays[name]',self.overlays[name]);
                self.overlays[name].show();
            }
    };

    var closeOverlayHandler = function function_name() {
        $('.overlay').hide();
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

    init();

    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
