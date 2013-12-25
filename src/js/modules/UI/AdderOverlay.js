define(["env", "when", "jquery", "templates", "Renderer", "Overlay"], function AdderOverlay(env, when, $, Template, Renderer, Overlay) {
    var AdderOverlay = function AdderOverlay(androdial) {
        this.$overlay = $(Template["adder-overlay"]());
    };

    AdderOverlay.prototype = Overlay;

    return (function initOverlay () {
        var overlay = new AdderOverlay();

        overlay.render();

        return overlay
    })();
});
