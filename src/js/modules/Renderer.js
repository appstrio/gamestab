define(['jquery', 'templates'], function Renderer($, templates) {
    var self = {
        $wrapper: $('#wrapper'),
        $layout: $(templates['classic']())
    };

    self.renderDial = function (dial) {
        log(dial);
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click)
            .on('click', '.dial-remove-button', dial.remove);
        return self.$dialsPage.append($dial)
        // if (dial.screenshotDefer && dial.screenshotDefer.promise) {
        //     dial.screenshotDefer.promise().done(function () {
        //         //css('background-image', 'url(' + dial.screenshot + ')');
        //     });
        // }
    };

    self.renderApp = function (app) {
        var $newApp = $(templates['classic-dial'](app))
            .data('app', app)
            .on('click',app.click)
            .on('click', '.app-remove-button', app.remove);
        return self.$appsPage.append($newApp);
    };

    self.appsSwitchClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();

        self.$appsSwitch.addClass('selected');
        self.$dialsSwitch.removeClass('selected');

        self.$dialsPage.hide();
        self.$appsPage.show();
    };

    self.dialsSwitchClickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();

        self.$appsSwitch.removeClass('selected');
        self.$dialsSwitch.addClass('selected');

        self.$dialsPage.show();
        self.$appsPage.hide();
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
    self.renderApps = function renderApps (appsArr) {
        for (var i = appsArr.length - 1; i >= 0; i--) {
            var appDial = appsArr[i];
            self.renderApp(appDial)
        };
    }

    self.render = (function initRenderer () {
        // setup generel layout
        self.$wrapper.html(self.$layout);

        $.extend(self, {
            $searchWrapper : self.$layout.find('.search-wrapper').eq(0),
            $dialsPage  : self.$wrapper.find('.page0').eq(0),
            $appsPage   : self.$wrapper.find('.page1').eq(0),
            $appsSwitch    : self.$wrapper.find('.apps-switch').eq(0),
            $dialsSwitch   : self.$wrapper.find('.dials-switch').eq(0)
        });
        // setup search layout
        self.$searchWrapper.html($(templates['search-wrapper']())); // WAS {}
        self.setEventHandlers();
    })();

    return self;
});
