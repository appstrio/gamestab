"use strict";

define(['underscore', 'jquery', 'templates', 'when', 'renderer'], function menuRenderer(_, $, templates, when, renderer) {
    var initting = when.defer(),
        self = {
            // name: "menu"
            promise: initting.promise,
            // settings: {},
        };
        // defaultSettings = {},
    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    self.init = function initModule(options) {
        //TODO change into a general ".switch".on click
        $('#dials-switch').on ('click', switchHandler('dials'));
        $('#apps-switch').on('click', switchHandler('apps'));

        //TODO: Default switch is hardcoded
        $('#dials-switch').addClass('selected');

        return initting.resolve();
    };

    //TODO do we need references to the objects if we only use them here?
    var switchHandler = function (name) {
        return function() {
            //Remove highlighting from all switches and highlight the selected one
            $('.switch').removeClass('selected');
            renderer["$" + name + "Switch"].addClass('selected');
            //Show only the selected page
            $(".dials-wrapper").hide()
            renderer["$" + name + "Wrapper"].show();
        }
    };

    var errorLoading = function(err) {
        // alert('Error loading, try to refersh or re-install the app.');
        console.log('Error loading, try to refersh or re-install the app.');
    };

    initting.promise.catch (errorLoading);

    return self;
}, rErrReport);
