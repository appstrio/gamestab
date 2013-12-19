'use strict';

define(['jquery', 'Renderer', 'Dial', 'when'], function($, renderer, Dial, when) {
    if(DEBUG || DEBUG.logLoadOrder) console.log("Loading Module : AppDial");
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
                    // No need for those, they get filled-in the prototype
                    // title : title,
                    // icon  : icon,
                });
        };

        init();

        return self;
    };
});
