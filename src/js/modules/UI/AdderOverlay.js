define(["env", "when", "jquery", "templates", "Renderer", "Overlay"], function AdderOverlayModule(env, when, $, Template, Renderer, Overlay) {
    "use strict";

    var AdderOverlay = function AdderOverlay() {
        this.$overlay = $(Template["adder-overlay"]());
        this.$content = this.$overlay.find(".content").eq(0);
    };

    AdderOverlay.prototype = Overlay;

    return (function initOverlay () {
        var overlay = new AdderOverlay();

        overlay.init();
        overlay.render();

        return overlay;
    })();
});
