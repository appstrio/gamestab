define(['jquery', 'templates'], function Renderer($, templates) {
    var self = {
        $wrapper: $('#wrapper'),
        $layout: $(templates['classic']())
    };

    self.renderDial = function (dial) {
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click);
        $dial.find('.dial-remove-button').on('click', dial.remove)
        return self.$dialsWrapper.append($dial)
        // if (dial.screenshotDefer && dial.screenshotDefer.promise) {
        //     dial.screenshotDefer.promise().done(function () {
        //         //css('background-image', 'url(' + dial.screenshot + ')');
        //     });
        // }
    };

    self.renderApp = function (app) {
        var $newApp = $(templates['classic-app'](app))
            .data('app', app)
            .on('click',app.click);
        $newApp.find('.app-remove-button').on('click',app.remove);
        return self.$appsWrapper.append($newApp);
    };

    self.wrapperClickHandler = function (e) {
        e.stopPropagation();
        console.log('renderer.$wrapper', self.$wrapper);
        self.$wrapper.toggleClass('launcher-maximized');
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

    self.setEventHandlers = function () {
        self.$wrapper.on('click', '.apps-switch', self.appsSwitchClickHandler);
        self.$wrapper.on('click', '.dials-switch', self.dialsSwitchClickHandler);
    };

    self.renderDials = function renderDials (dialsArr) {
        for (var i = dialsArr.length - 1; i >= 0; i--) {
            var dial = dialsArr[i];
            self.renderDial(dial);
        };
    }
    self.renderApps = function renderApps (dialsArr) {
        for (var i = dialsArr.length - 1; i >= 0; i--) {
            var appDial = dialsArr[i];
            self.renderApp(appDial)
        };
    }

    self.render = function initRenderer (dials) {
        // setup generel layout
        self.$wrapper.html(self.$layout);

        $.extend(self, {
            $searchWrapper : self.$layout.find('.search-wrapper').eq(0),
            $dialsWrapper  : self.$wrapper.find('.dials-wrapper').eq(0),
            $appsWrapper   : self.$wrapper.find('.apps-wrapper').eq(0),
            $appsSwitch    : self.$wrapper.find('.apps-switch').eq(0),
            $dialsSwitch   : self.$wrapper.find('.dials-switch').eq(0)
        });
        // setup search layout
        self.$searchWrapper.html($(templates['search-wrapper']())); // WAS {}
        self.setEventHandlers();
    }

    return self;
});
