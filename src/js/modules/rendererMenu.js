"use strict";

define(['underscore', 'jquery', 'templates', 'when'], function menuRenderer(_, $, templates, when) {
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
    self.init = function initModule(options) {
        //TODO change into a general ".switch".on click
        $('#dialsSwitch').on ('click', switchHandler('$apps'));
        $('#appsSwitch').on('click', switchHandler('$dials'));

        initting.resolve();
    };

    //TODO do we need references to the objects if we only use them here?
    var switchHandler = function (name) {
        return function() {
            //Remove highlighting from all switches and highlight the selected one
            $('.switch').removeClass('selected');
            $("#" + name + "Switch").addClass('selected');
            //Show only the selected page
            $(".dials-wrapper").hide()
            $("#" + name + "Wrapper").show();
        }
    };

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
