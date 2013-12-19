'use strict';

define(['env', 'jquery', 'Renderer', 'Dial', 'when'], function(env, $, renderer, Dial, when) {
    if(env.DEBUG || env.logLoadOrder) console.log("Loading Module : AppDial");
    return function newAppDial(id, title, icon, description, options) {
        var parent = Dial('', title, icon, {
            setEventHandlers: false
        }),
            options = options || {},
            self = Object.create(parent);

        var init = function initDial() {
            var setEventHandlers = options.setEventHandlers || true;

            // check if passing object as first argument
            if (id && !title && !icon) $.extend(self, url);
            else
                $.extend(self, {
                    id: id,
                    url: '',
                    description: description
                });
        };

        init();

        return self;
    };
});
