define(['jquery', 'templates'], function Renderer($, templates) {
    var self = {
        $wrapper: $('#wrapper'),
        $layout: $(templates['classic']())
    };
    $.extend(self, {
        $searchWrapper : self.$layout.find('.search-wrapper').eq(0),
        $dialsWrapper  : self.$wrapper.find('.dials-wrapper').eq(0),
        $appsWrapper   : self.$wrapper.find('.apps-wrapper').eq(0),
        $appsSwitch    : self.$wrapper.find('.apps-switch').eq(0),
        $dialsSwitch   : self.$wrapper.find('.dials-switch').eq(0)
    });

    self.renderDial = function (dial) {
        var $dial = $(templates['classic-dial'](dial))
            .data('dial', dial);
        $dial.find('.thumbnail-wrapper').html(dial.url);
        self.$dialsWrapper.append($dial);

        // if (dial.screenshotDefer && dial.screenshotDefer.promise) {
        //     dial.screenshotDefer.promise().done(function () {
        //         //css('background-image', 'url(' + dial.screenshot + ')');
        //     });
        // }

    };

    self.renderApp = function (app) {
        var newApp = $(templates['classic-app'](app));
        newApp.data('app', app);
        self.$appsWrapper.append(newApp);
    };

    self.wrapperClickHandler = function (e) {
        // e.stopPropagation();
        // console.log('renderer.$wrapper', renderer.$wrapper);
        // renderer.$wrapper.toggleClass('launcher-maximized');
    };

    self.appsSwitchClickHandler = function (e) {
        e.stopPropagation();
        // e.preventDefault();

        // self.$appsSwitch.addClass('selected');
        // self.$dialsSwitch.removeClass('selected');

        // self.$dialsWrapper.hide();
        // self.$appsWrapper.show();
    };

    self.dialsSwitchClickHandler = function (e) {
        // e.stopPropagation();
        // e.preventDefault();

        // self.$appsSwitch.removeClass('selected');
        // self.$dialsSwitch.addClass('selected');

        // self.$dialsWrapper.show();
        // self.$appsWrapper.hide();
    };

    self.setEventHandlers = function () {
        // renderer.$wrapper.on('click', '.dial', self.dialClickHandler);
        // renderer.$wrapper.on('click', '.dial-remove-button', self.dialRemoveClickHandler);

        // renderer.$wrapper.on('click', '.app', self.appClickHandler);
        // renderer.$wrapper.on('click', '.app-remove-button', self.appRemoveClickHandler);

        // renderer.$wrapper.on('click', '.apps-switch', self.appsSwitchClickHandler);
        // renderer.$wrapper.on('click', '.dials-switch', self.dialsSwitchClickHandler);
    };

    self.render = function initRenderer () {
        // setup generel layout
        self.$wrapper.html(self.$layout);
        // setup search layout
        self.$searchWrapper.html($(templates['search-wrapper']())); // WAS {}
    }

    return self;
});
