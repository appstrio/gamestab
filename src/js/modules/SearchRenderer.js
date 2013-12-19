'use strict';

define(['env', 'underscore', 'jquery', 'templates', 'when', 'Renderer'], function SearchRenderer(env, _, $, templates, when, renderer) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : SearchRenderer");
    var initting = when.defer(),
        self = {
            // name: "search"
            promise: initting.promise,
            // settings: {},
        };
        // defaultSettings = {},
    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    var init = function initModule(options) {
        // widely used dom selectors
        self.$searchWrapper = renderer.$layout.find('.search-wrapper').eq(0);
        // setup search layout
        self.$searchWrapper.html($(templates['search-wrapper']()));

        return initting.resolve();
    };
    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    //MISC

    self.focusOnSearch = function () {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.update(tab.id, {
                selected: true
            }, function() {
                $('.search-input').blur().focus();
            });
        });
    };

    //Init after dependencies have loaded;
    init();

    //If init fails handlers
    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
