"use strict";

define(['env','jquery', 'when', 'Runtime'], function OverlayMediator(env,$, when, runtime) {
    if(DEBUG && DEBUG.logLoadOrder) console.log("Loading Module : OverlayMediator");
    return function newOverlayMediator(originalDial, provider) {
        var self = {
            originalDial: originalDial
        },
            options = options || {};
        /**
         * @param options {setEventHandlers : true}
         **/
        var init = function initoriginalDial() {;
            // Expose core functionality (for providers)

            self.getRaw = originalDial.getRaw;
            self.setRaw = originalDial.setRaw;

            // Use the same interface as Regular Dials, but give them names that say what they actually do (Removing and adding originalDial from the providers dial list)
        };

        //NOTE: event handlers are called via DOM events (e = dom element).

        init();

        return self;
    };
});
