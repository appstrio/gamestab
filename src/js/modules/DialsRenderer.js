define(["env", "underscore", "jquery", "Renderer", "templates", "when", "StoredDialsProvider", "WebAppsListProvider", "ChromeAppsProvider", "AndroidAppsListProvider", "LovedGamesGamesProvider", "Runtime", "AdderOverlay", "Overlay", "Alert", "sitesProvider", "defaultByCountryProvider"], function DialsRenderer(env, _, $, Renderer, templates, when, StoredDialsProvider, WebAppsListProvider, ChromeAppsProvider, AndroidAppsListProvider, LovedGamesGamesProvider, Runtime, AdderOverlay, Overlay, Alert, sitesProvider, defaultByCountryProvider) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : DialsRenderer");
    }

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            maxDials: null,
            currentDials: [],
            timeout: 0,
        };
    self.STATUS = {};

    /**
     *  starts the module :
     *  * save reference to important DOM elements
     *  * render dials into dials-wrapper, apps-wrapper and overlay-wrapper
     *  @param options Custom settings to override self.settings
     **/
    var init = function initModule(runtimeData) {
        var renderingStoredDials, renderingAdderOverlay, renderingChromeApps;
        // widely used dom selectors
        $.extend(self, {
            $adderOverlayBtn: $("#webapps-overlay-btn").eq(0),
            $adderOverlay: AdderOverlay.$content,
        });

        //Must be set before renderProvider is called
        self.maxDials = runtimeData.maxDials;

        // var defaultDialsByCountryJSONPath = runtimeData.JSONPrefix + "/defaults" + runtimeData.countryCode.toUpperCase() + ".json",
        //     defaultDialsByCountryProvider = new JSONProvider("defaultDialsByCountryProvider", defaultDialsByCountryJSONPath, true),
        //     sitesProvider = new JSONProvider("sitesListProvider", runtimeData.JSONPrefix + "/bestsites.json", true);

        renderingAdderOverlay = self.renderProviders([
            defaultByCountryProvider,
            sitesProvider
        ], self.$adderOverlay, {
            optOverlayDial: true
        });
        renderingStoredDials = self.renderProvider(StoredDialsProvider, Renderer.$dialsWrapper);
        renderingChromeApps = self.renderProvider(ChromeAppsProvider, Renderer.$appsWrapper);

        //TODO hardcoded
        $("#dials-wrapper").show();

        setEventHandlers();

        return when.all([
            renderingStoredDials,
            renderingAdderOverlay,
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
        });

        return rendering.promise;
    };

    self.renderProviders = function(providers, $container, _options) {
        var rendering = when.defer(),
            options = $.extend({
                cleanContainer: false,
            }, _options);

        _.each(providers, function(provider) {
            provider.promise.then(function(dials) {
                renderDials(provider, $container, dials, options);
                setTimeout(function() {
                    rendering.resolve();
                }, 0);
            });
        });

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

            dials = dials.slice(0, rowLength);

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

        if (options.cleanContainer) {
            $container.html("");
        }

        var maxDials = options.maxDials || dials.length;
        for (var i = 0; i < dials.length && i < maxDials; i++) {
            var dial = dials[i];
            self.renderDial(provider, $container, dial, options);
        }

        return when.resolve();
    };

    self.renderDial = function(provider, $container, dial, _options) {
        var $dial, options = $.extend({
                optOverlayDial: false
            }, _options);

        if (options.optOverlayDial) {
            dial.oldLaunch = dial.launch;
            dial.launch = overlayDialLaunchHandler(dial);
            $dial = $(templates["overlay-dial"](dial));
        } else {
            $dial = $(templates["classic-dial"](dial));
        }

        if (Renderer.$dialsWrapper === $container) {
            self.currentDials.push(dial);
        }

        $dial.on("click", dial.launch);
        $dial.on("click", ".dial-remove-button", self.renderDialRemovalFactory(provider, dial));

        if (dial.id) {
            $dial.data("id", dial.id);
        }

        $dial.hide();
        $container.append($dial);
        $dial.fadeIn();

        return $dial;
    };


    var overlayDialLaunchHandler = function(dial) {
        return function() {
            if (self.currentDials.length < self.maxDials) {
                var adding = StoredDialsProvider.addDial(dial);
                adding.then(function callRenderDial(dial) {
                    dial.launch = dial.oldLaunch;
                    delete dial.oldLaunch;
                    self.renderDial(StoredDialsProvider, Renderer.$dialsWrapper, dial);
                    Alert.show("You Added an app. Yay!");
                }).otherwise(env.errhandler);
                return adding.promise;
            } else {
                Alert.show("No more room, delete something first!");
            }
        };
    };

    self.renderDialRemovalFactory = function(provider, dial) {
        return function(e) {
            e.stopPropagation();
            e.preventDefault();

            // If provider has this method, it is responsible for displaying the message.
            if (provider.removeDialFromList) {
                var removing = provider.removeDialFromList(dial);
                removing.then(function() {
                    var $ele = $(e.currentTarget).parents(".dial").eq(0);
                    $ele.fadeOut(function() {
                        $ele.off().remove();
                    });
                });
            }

            if (provider.name === "StoredDialsProvider") {
                var index = self.currentDials.indexOf(dial);
                self.currentDials = self.currentDials.splice(index, 1);

                Alert.show("Moved.. to the TRASH!");
            }
        };
    };

    var setEventHandlers = function() {
        self.$adderOverlayBtn.on("click", function(e) {
            AdderOverlay.open(e);
        });
        Renderer.$fadescreen.on("click", Overlay.closeOverlayHandler);
    };

    //SRC: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    var shuffleArray = function shuffle(o) { //v1.0
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };
    Runtime.promise.then(init, env.errhandler);

    if (DEBUG && DEBUG.exposeModules) {
        window.DialsRenderer = self;
    }

    return self;
});
