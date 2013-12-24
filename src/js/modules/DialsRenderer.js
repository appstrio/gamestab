"use strict";

define(['env', 'underscore', 'jquery', 'Renderer', 'templates', 'when', 'StoredDialsProvider', 'WebAppsListProvider', 'ChromeAppsProvider', 'AndroidAppsListProvider', 'Runtime'], function DialsRenderer(env, _, $, renderer, templates, when, StoredDialsProvider, WebAppsListProvider, ChromeAppsProvider, AndroidAppsListProvider, Runtime) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : DialsRenderer");

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            androRow: false,
        };

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

        renderingStoredDials = renderDialsByRow([{
            provider: StoredDialsProvider,
        }, {
            provider: AndroidAppsListProvider,
            shuffle: true
        }, {
            provider: AndroidAppsListProvider,
            shuffle: true
        }], {
            maxDials: 18,
            $container: renderer.$dialsWrapper,
        });
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
        var renderingRows = [],
            $container = options.$container,
            maxDials = options.maxDials || 18,
            rowsCount = rows.length,
            dialsPerRow = maxDials / rowsCount;
        _.each(rows, function renderRow(row) {
            var rendering = when.defer(),
                rowProvider = row.provider;
            renderingRows.push(rendering.promise);

            rowProvider.promise.then(function(dials) {
                var rowLength = dials.length > dialsPerRow ? dialsPerRow : dials.length,
                    options = {
                        maxDials: rowLength,
                        disableContainerClean: true,
                    };

                options.maxDials = rowLength;
                if (row.shuffle)
                    dials = shuffleArray(dials);

                renderDials(rowProvider, $container, dials, options)
                    .then(rendering.resolve).otherwise(rendering.reject)
            }).otherwise(env.errhandler);
        });

        return when.all(renderingRows)
    }
    /**
     * @param options {maxDials: number}
     */
    var renderDials = function renderDials(provider, $container, dials, options) {
        options = options || {};
        //Clean dials zone
        if(!options.disableContainerClean)
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
        $dial.on('click', '.dial-remove-button', self.renderDialRemovalMaker(provider, dial));

        if (dial.id) $dial.data('id', dial.id);

        $dial.hide();
        $container.append($dial);
        $dial.fadeIn();

        return $dial;
    };

    self.renderDialRemovalMaker = function(provider, dial) {
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
            var adding = StoredDialsProvider.addDial(dial)
            adding.then(function callRenderDial(dial) {
                dial.launch = dial.oldLaunch
                delete dial.oldLaunch
                self.renderDial(StoredDialsProvider, renderer.$dialsWrapper, dial)
            }).otherwise(function callErrorDisplayer(msg) {
                alert(msg)
            })
            return adding.promise
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
