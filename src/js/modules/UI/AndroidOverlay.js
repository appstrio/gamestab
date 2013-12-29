define(["env", "when", "templates", "DialsRenderer", "Overlay", "AndroIt"], function AndroidOverlay(env, when, Template, DialsRenderer, Overlay, AndroIt) {

    var init = function () {
        var lang = {
            "confirm"    : "Install!",
            "cancel"     : "Cancel",
            "confirmMsg" : "Are you sure you want to install this app?"
        }, self = this;

        this.confirmed = when.defer();
        this.promise   = this.confirmed.promise;

        this.$overlay  = $(Template["android-overlay"]({"dial":this.androdial, "lang": lang}));
        this.$overlay.find("#confirm").click(this.confirmed.resolve);
        this.$overlay.find("#cancel").click(this.confirmed.reject);

        this.render();
        this.setEventHandlers();

        var devices = this.$overlay.find("#devices");
        $.each(AndroIt.devicesList, function() {
            devices.append($("<option />").val(this.deviceID).text(this.deviceModelName));
        })

        this.open();

        this.confirmed.promise.then(function callInstallApp() {
            var deviceID = devices.val()
            AndroIt.install(self.androdial.appID, deviceID)
        }).ensure(function callInstallApp() {
            self.closeOverlayHandler();
            self.$overlay.remove();
        })

        return this;
    }

    var AndroidOverlay = function AndroidOverlay(androdial) {
        this.init = init;
        this.androdial = androdial;
    };
    AndroidOverlay.prototype = Overlay;

    return AndroidOverlay;
})
