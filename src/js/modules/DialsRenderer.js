"use strict";

define(['env', 'underscore', 'jquery', 'Renderer', 'templates', 'when', 'StoredDialsProvider', 'WebAppsListProvider', 'ChromeAppsProvider', 'AndroidAppsListProvider', 'Runtime'], function DialsRenderer(env, _, $, renderer, templates, when, StoredDialsProvider, WebAppsListProvider, ChromeAppsProvider, AndroidAppsListProvider, Runtime) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : DialsRenderer");

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            androRow: false,
            maxDials: null,
            currentDials: [],
            timeout: 0,
        };
    self.STATUS = {}

    /**
     *  starts the module :
     *  * save reference to important DOM elements
     *  * render dials into dials-wrapper, apps-wrapper and overlay-wrapper
     *  @param options Custom settings to override self.settings
     **/
    var init = function initModule(runtimeData) {
        var renderingStoredDials, renderingWebApps, renderingChromeApps;
        // widely used dom selectors
        $.extend(self, {
            $webAppsOverlayBtn: $('#webapps-overlay-btn').eq(0),
            $webAppsOverlay: $('#webapps-overlay').eq(0),
            $fadescreen: $('#fadescreen').eq(0),
        });

        //Must be set before renderProvider is called
        self.androRow = runtimeData.androRow;
        self.maxDials = runtimeData.maxDials

        when.join(
            StoredDialsProvider.promise,
            AndroidAppsListProvider.promise
        ).then(function render(dialsArray) {
            var StoredDialsDials = dialsArray[0],
                AndroidAppsDials = dialsArray[1];

            renderingStoredDials = renderDialsByRow([{
                provider: StoredDialsProvider,
                dials: StoredDialsDials,
            }, {
                provider: AndroidAppsListProvider,
                dials: AndroidAppsDials,
                shuffle: true
            }, {
                provider: AndroidAppsListProvider,
                dials: AndroidAppsDials,
                shuffle: true
            }], {
                maxDials: self.maxDials,
                $container: renderer.$dialsWrapper,
            });
        }).otherwise(env.errhandler)

        renderingWebApps = self.renderProvider(WebAppsListProvider, self.$webAppsOverlay)
        renderingChromeApps = self.renderProvider(ChromeAppsProvider, renderer.$appsWrapper)
        // renderingAndroidApps = self.renderProvider(AndroidAppsListProvider, renderer.$androidWrapper);

        //TODO hardcoded
        $("#dials-wrapper").show();

        setEventHandlers();

        return when.all([
            renderingStoredDials,
            renderingWebApps,
            renderingChromeApps
        ], initting.resolve, initting.reject);
    };

    self.renderProvider = function(provider, $container, options) {
        var rendering = when.defer();

        provider.promise.then(function(dials) {
            renderDials(provider, $container, dials, options);
            setTimeout(function() {
                rendering.resolve();
            }, 0);
        }).otherwise(env.errhandler);

        return rendering.promise;
    };

    var renderDialsByRow = function(rows, options) {
        var $container = options.$container,
            maxDials = options.maxDials || 18,
            rowsCount = rows.length,
            dialsPerRow = maxDials / rowsCount;

        var rendering = _.map(rows, function renderAggregatedDials(row) {
            var dials = row.dials,
                rowLength = dials.length > dialsPerRow ? dialsPerRow : dials.length,
                options = {
                    maxDials: rowLength,
                    cleanContainer: false,
                };

            if (row.shuffle)
                dials = shuffleArray(dials);

            dials = dials.slice(0,rowLength);

            return renderDials(row.provider, $container, dials, options)
        });

        return when.all(rendering);
    }

    /**
     * @param options {maxDials: number}
     */
    var renderDials = function renderDials(provider, $container, dials, options) {
        options = $.extend({
            cleanContainer: true
        }, options);

        if(options.cleanContainer)
            $container.html('');

        var maxDials = options.maxDials || dials.length;
        for (var i = 0; i < dials.length && i < maxDials; i++) {
            var dial = dials[i];
            self.renderDial(provider, $container, dial, options);
        };

        return when.resolve();
    };

    self.renderDial = function(provider, $container, dial, options) {
        var $dial
        if (provider.name == "WebAppsListProvider") {
            dial.oldLaunch = dial.launch;
            dial.launch = overlayDialLaunchHandler(dial);
            $dial = $(templates['overlay-dial'](dial));
        } else
            $dial = $(templates['classic-dial'](dial));


        $dial.on('click', dial.launch);
        $dial.on('click', '.dial-remove-button', self.renderDialRemovalFactory(provider, dial));

        if (dial.id) $dial.data('id', dial.id);

        $dial.hide();
        $container.append($dial);
        $dial.fadeIn();

        return $dial;
    };

    self.renderDialRemovalFactory = function(provider, dial) {
        return function(e) {
            e.stopPropagation();
            e.preventDefault();

            if (provider.removeDialFromList) {
                var removing = provider.removeDialFromList(dial);
                removing.then(function() {
                    var $ele = $(e.currentTarget).parents('.dial').eq(0);
                    $ele.fadeOut(function() {
                        $ele.off().remove();
                    });
                });
                if(provider.name === "StoredDialsProvider") {
                    var index = self.currentDials.indexOf(dial);
                    self.dials = self.dials.splice(index, 1);
                }
            }
        }
    };

    var openOverlayHandler = function function_name($element) {
        return function(e) {
            e.stopPropagation();
            e.preventDefault();
            //Show only the selected page
            $('.overlay').hide();
            self.$fadescreen.removeClass('hide');
            self.$fadescreen.fadeIn();
            $element.show();
        };
    };

    var noopOverlayHandler = function function_name(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    var closeOverlayHandler = function function_name() {
        $('.overlay').hide();
        self.$fadescreen.fadeOut(function() {
            self.$fadescreen.addClass('hide');
        });
    };

    var overlayDialLaunchHandler = function(dial) {
        return function(e) {
            if(self.currentDials.length < self.maxDials) {
                var adding = StoredDialsProvider.addDial(dial)
                adding.then(function callRenderDial(dial) {
                    dial.launch = dial.oldLaunch
                    delete dial.oldLaunch
                    self.renderDial(StoredDialsProvider, renderer.$dialsWrapper, dial)
                }).otherwise(env.errhandler)
                return adding.promise
            } else when.reject("No more room, delete something first!")
        }
    }

    var setEventHandlers = function() {
        self.$webAppsOverlayBtn.on('click', openOverlayHandler(self.$webAppsOverlay));
        self.$webAppsOverlay.on('click', noopOverlayHandler); // HACK to not-close overlay if user clicked directly on the overlay (instead of on the fadescreen).
        self.$fadescreen.on('click', closeOverlayHandler);
    };

    //SRC: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    var shuffleArray = function shuffle(o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };
    Runtime.promise.then(init, env.errhandler);
    initting.promise.otherwise(env.errhandler);

    return self;
});
