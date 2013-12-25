'use strict';

define(['env', 'underscore', 'jquery', 'templates', 'when'], function Renderer(env, _, $, templates, when) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log('Loading Module : Renderer');
    var
    // initting = when.defer(),
        self = {
            // promise: initting.promise
        };

    /**
     * Callback function for self.promise success
     * @param options Custom settings to override self.settings
     */
    var init = function initModule(options) {

        // setup the general layout
        self.$wrapper        = $('#wrapper');
        self.$layout         = $(templates['classic']());

        // setup general layout
        self.$wrapper.html(self.$layout);
        $.extend(self, {
            $dialsSwitch    : $('#dials-switch'),
            $appsSwitch     : $('#apps-switch'),
            $androidSwitch  : $('#android-switch'),

            $dialsWrapper   : $('#dials-wrapper'),
            $appsWrapper    : $('#apps-wrapper'),
            $androidWrapper : $('#android-wrapper'),

            $fadescreen     : $('#fadescreen').eq(0),
        })

        // setTimeout(function(){
        //     return initting.resolve();
        // }, 0);
    };

    init();

    // initting.promise.otherwise(env.errhandler);

    return self;
});
