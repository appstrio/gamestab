define(['underscore','renderer', 'promise!async_chromeapps', 'promise!async_topsites', 'templates'], function ClassicLauncher(underscore,renderer, chromeapps, topsites, templates) {
    var self = {};

    self.renderer = renderer;
    self.chromeapps = chromeapps;
    self.topsites = topsites;
    self.$dialsWrapper = self.renderer.$wrapper.find('.dials-wrapper').eq(0);
    self.$appsWrapper = self.renderer.$wrapper.find('.apps-wrapper').eq(0);

    self.$appsSwitch = self.renderer.$wrapper.find('.apps-switch').eq(0);
    self.$dialsSwitch = self.renderer.$wrapper.find('.dials-switch').eq(0);

    self.render = function () {
        var newDial;
        for(self.topsites.topsites, function (dial) {
            self.renderDial(dial);
        });

        for(self.chromeapps.apps, function (app) {
            self.renderApp(app);
        });

        // self.setEventHandlers();
    };



    self.setEventHandlers = function () {
        // self.renderer.$wrapper.on('click', '.dial', self.dialClickHandler);
        // self.renderer.$wrapper.on('click', '.dial-remove-button', self.dialRemoveClickHandler);

        // self.renderer.$wrapper.on('click', '.app', self.appClickHandler);
        // self.renderer.$wrapper.on('click', '.app-remove-button', self.appRemoveClickHandler);

        // self.renderer.$wrapper.on('click', '.apps-switch', self.appsSwitchClickHandler);
        // self.renderer.$wrapper.on('click', '.dials-switch', self.dialsSwitchClickHandler);
    };

    self.dialClickHandler = function (e) {
        e.stopPropagation();
        var $target = $(e.currentTarget);
        var url = $target.data('url');

        if (window.analytics) window.analytics.sendEvent({category: 'Dials', action: 'Click', label: url}, function () {
            window.location.href = url;
        });

        setTimeout(function () {
            window.location.href = url;
        }, 500);
    };

    self.dialRemoveClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.dial').eq(0);
        $target.fadeOut(function () {
            self.topsites.getAndAddNewDial(function (err, newDial) {
                if (newDial) {
                    _.defer(function () {
                        self.renderDial(newDial);
                    });

                }
            });
        });
        self.topsites.addToIgnored($target.data('url'));
    };

    self.appClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget);
        var id = $target.data('id');
        chrome.management.launchApp(id, function () {
        });
    };

    self.appRemoveClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.app').eq(0);
        var id = $target.data('id');
        chrome.management.uninstall(id, {showConfirmDialog: true}, function () {
            chrome.management.getAll(function (apps) {
                apps = apps || [];
                var found = _.findWhere(apps, {id: id});
                if (!found) {
                    $target.fadeOut();
                }
            });

        });
    };

    self.appsSwitchClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();

        self.$appsSwitch.addClass('selected');
        self.$dialsSwitch.removeClass('selected');

        self.$dialsWrapper.hide();
        self.$appsWrapper.show();
    };

    self.dialsSwitchClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();

        self.$appsSwitch.removeClass('selected');
        self.$dialsSwitch.addClass('selected');

        self.$dialsWrapper.show();
        self.$appsWrapper.hide();
    };

    self.wrapperClickHandler = function (e) {
        e.stopPropagation();
        console.log('self.renderer.$wrapper', self.renderer.$wrapper);
        self.renderer.$wrapper.toggleClass('launcher-maximized');
    };

    return self;
});