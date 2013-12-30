define(["env", "when", "jquery", "templates", "Renderer"], function Overlay(env, when, $, Template, Renderer) {
    var Overlay = function Overlay(androdial) {

        this.noopOverlayHandler = function noopOverlayHandler(e) {
            e.stopPropagation();
            e.preventDefault();
        };

        this.closeOverlayHandler = function closeOverlayHandler() {
            $('.overlay').hide();
            Renderer.$fadescreen.fadeOut(function() {
                Renderer.$fadescreen.addClass('hide');
            });
        };

        this.open = function openOverlay(DOMEvent) {
            if(DOMEvent) {
                DOMEvent.stopPropagation();
                DOMEvent.preventDefault();
            }
            //Show only the selected page
            $('.overlay').hide();
            Renderer.$fadescreen.removeClass('hide');
            Renderer.$fadescreen.fadeIn();
            this.$overlay.show();
        };

        this.close = function closeOverlay() {};

        this.render = function() {
            Renderer.$fadescreen.append(this.$overlay)
            this.$overlay.fadeIn();
        };

        this.setEventHandlers = function () {
            this.$overlay.click(this.noopOverlayHandler);
        };

        this.init = function() {
            this.setEventHandlers();
        };
    };

    return new Overlay();
})
