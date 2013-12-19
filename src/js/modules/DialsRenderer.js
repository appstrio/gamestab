"use strict";

define(['env', 'underscore', 'jquery', 'Renderer', 'templates','when' , 'StoredDialsProvider', 'WebAppsListProvider', 'AppsProvider', 'Runtime'], function DialsRenderer(env, _, $, renderer, templates, when, StoredDialsProvider, WebAppsList, apps, runtime) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : DialsRenderer");

    var initting = when.defer(),
        self = {
            // name: "dials"
            promise: initting.promise,
            // settings: {},
            providers: {}
        };


    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    var init = function initModule(options) {

        // widely used dom selectors
        self.$webAppsOverlayBtn = $('#web-apps-overlay-btn');
        self.$webAppsOverlay = $('#web-apps-overlay');
        self.$fadescreen = $('#overlays');

        var prov = StoredDialsProvider();

        // Fetch existing dials

        prov.promise.then(function (dials) {
            self.renderDialsArr(dials, renderer.$dialsWrapper, {
            });
        });
        WebAppsList.promise.then(function(dials) {
            self.renderDialsArr(dials, renderer.$webAppsOverlay);
        });

        apps.promise.then(function(apps) {
            self.renderDialsArr(apps, renderer.$appsWrapper);
        });

        //TODO hardcoded
        $("#dials-wrapper").show();

        setEventHandlers();

        return when.all([WebAppsList.promise, apps.promise], initting.resolve, initting.reject);
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
            .on('click', '.dial-remove-button',provider.removeDialFromList(dial));

        self.setDialEventHandlers(dial);

        if (dial.id)
            $dial.data('id', dial.id);

        return $parent.append($dial);
    };

    self.setDialEventHandlers = function(dial) {
        return dial.removing.then(self.renderDialRemoval);
    }

    self.renderDialRemoval = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var removing = when.defer(),
            $ele = $(e.currentTarget).parents('.dial').eq(0);
        $ele.fadeOut(removing.resolve);

        return false;
    }

    self.addDial = function() {
        // render new dial
        // add dial to runtime.dials and save that
        //
    }

    self.launchDial = function launchHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        var url = $(e.currentTarget).find('a').attr('href');

        if (window.analytics) {
            window.analytics.sendEvent({
                category: 'Dials',
                action: 'Click',
                label: url
            }, function() {
                window.location.href = url;
            });
        }

        setTimeout(function() {
            window.location.href = url;
        }, 500);
    };

    self.removeDial = function (e) {
         var removing = when.defer(),
            tmpIdentity = getDialIdentifiersFromDOMElement(e),
            identifierKey = tmpIdentity.key,
            identifierVal = tmpIdentity.val,
            oldDial = _.filter(self.dials, function isThisDial (dial) {
                return dial[identifierKey] == identifierVal;
            })

        self.storeDialList();

        return removing.resolve();
    }

    self.launchAndroidDial = function (e) {};
    self.removeAndroidDial = function (e) {};

    self.removeAppDial = function removeHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        var $target = $(e.currentTarget).parents('.dial').eq(0);
        var id = $target.data('id');

        chrome.management.uninstall(id, {
            showConfirmDialog: true
        }, function() {
            chrome.management.getAll(function(apps) {
                apps = apps || [];
                var found = _.findWhere(apps, {
                    id: id
                });
                if (!found) {
                    $target.fadeOut();
                }
            });
        });
    };

    self.launchAppDial = function launchHandler(e) {
        e.stopPropagation();
        e.preventDefault();

        chrome.management.launchApp(e.currentTarget.dataset.id, function() {});
    };

    self.removeOverlayDial = function removeFromProvider() {
        e.stopPropagation();
        e.preventDefault();

        webapps.removeDialFromList(self.originalDial);
        DialsRenderer.removeDial(self.originalDial);
    };

    self.launchOverlayDial = function addDialToRuntime(e) {
        e.stopPropagation();
        e.preventDefault();

        runtime.addDial(self.originalDial);
        DialsRenderer.addDial(self.originalDial);
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

    init();

    initting.promise.otherwise(env.errhandler);

    return self;
}, rErrReport);
