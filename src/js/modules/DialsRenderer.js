"use strict";

define(['env', 'underscore', 'jquery', 'Renderer', 'templates','when' ,'StoredDialsProvider', 'WebAppsProvider', 'ChromeAppsProvider', 'Runtime'], function DialsRenderer(env, _, $, renderer, templates, when,StoredDialsProvider, WebAppsProvider, ChromeAppsProvider, runtime) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialsRenderer");

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            providers: {}
        };


    /**
     *  starts the module :
     *  * save reference to important DOM elements
     *  * render dials into dials-wrapper, apps-wrapper and overlay-wrapper
     *  @param options Custom settings to override self.settings
     */
    var init = function initModule() {
        var promises = [];
        // widely used dom selectors
        self.$webAppsOverlayBtn = $('#web-apps-overlay-btn');
        self.$webAppsOverlay = $('#web-apps-overlay');
        self.$fadescreen = $('#overlays');

        // Fetch existing dials
        promises.push(self.renderProvider(StoredDialsProvider, renderer.$dialsWrapper, {maxDials : 18}));
        promises.push(self.renderProvider(WebAppsListProvider, renderer.$webAppsOverlay));
        promises.push(self.renderProvider(ChromeAppsProvider, renderer.$appsWrapper));

        //TODO hardcoded
        $("#dials-wrapper").show();

        setEventHandlers();

        return when.all(promises, initting.resolve, initting.reject);
    };


    /**
     *
     */

    self.renderProvider = function(provider, $container, options){
        var rendering = when.defer();
        console.log(provider);
        provider.promise.then(function(dials){
            self.renderDialsArr(provider, $container, dials, options);
            setTimeout(function(){
                rendering.resolve();
            }, 0);
        });

        return rendering.promise;
    };


    /**
     * @param options {maxDials: number}
     */
    self.renderDialsArr = function renderDials(provider, $container, dials, options) {
        options = options || {};
        //Clean dials zone
        $container.html('');

        var maxDials = options.maxDials || dials.length;
        for (var i = 0; i < dials.length && i < maxDials; i++) {
            var dial = dials[i];
            self.renderDial(provider, $container, dial, options);
        };

        return self;
    };

    self.renderDial = function(provider, $container, dial, options) {
        var $dial = $(templates['classic-dial'](dial));

        $dial.on('click', dial.launch);
        provider.removeDialFromList && $dial.on('click', '.dial-remove-button', self.renderDialRemoval(provider, dial));

        if (dial.id) $dial.data('id', dial.id);

        return $parent.append($dial);
    };



    self.renderDialRemoval = function(provider, dial){
        return function(e) {
            e.stopPropagation();
            e.preventDefault();

            var $ele = $(e.currentTarget).parents('.dial').eq(0);
            $ele.fadeOut(function(){
                $ele.off().remove();
                provider.removeDialFromList && provider.removeDialFromList(dial);
            });
        }
    };


    var openOverlayHandler = function function_name(name) {
        return function() {
            //Show only the selected page
            $('.overlay').hide();
            self.$fadescreen.removeClass('hide');
            self.$fadescreen.fadeIn();
            // console.log('self.overlays[name]',self.overlays[name]);
            self.overlays[name].show();
        };
    };

    var closeOverlayHandler = function function_name() {
        $('.overlay').hide();
        self.$fadescreen.fadeOut(function() {
            self.$fadescreen.addClass('hide');
        });
    };

    var setEventHandlers = function() {
        self.$webAppsOverlayBtn.on('click', openOverlayHandler('$webAppsOverlay'));
        self.$fadescreen.on('click', closeOverlayHandler);
    };

    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    init();

    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
