define(['jquery', 'templates'], function Renderer($, templates) {
    var self = {
        maxDials:18
    };

    self.renderDial = function (location, dial) {
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click)
            .on('click', '.dial-remove-button', dial.remove);
        return self.$wrapper.find(location).append($dial);
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

    self.dials =function renderDials (template, providerObject) {
        var provider, tpl;
        if(!providerObject)
            provider = template;
        else {
            tpl = template;
            provider = providerObject;
        };

        provider.provide().then(function (dials) {
            for (var i =  0; i < dials.length && i <= self.maxDials; i++) {
                var dial = dials[i];
                self.renderDial(template, dial);
            };
        });
        return self;
    }

    self.render = (function initRenderer () {

        self.$wrapper = $('#wrapper');
        self.$layout  = $(templates['classic']());

        self.$wrapper.html(self.$layout);

        $.extend(self, {
            $searchWrapper : self.$layout.find('.search-wrapper').eq(0),
            $dialsPage     : self.$wrapper.find('.page0').eq(0),
            $appsPage      : self.$wrapper.find('.page1').eq(0),
            $appsSwitch    : self.$wrapper.find('.apps-switch').eq(0),
            $dialsSwitch   : self.$wrapper.find('.dials-switch').eq(0),
        });
        // setup generel layout
        // setup search layout
        self.$searchWrapper.html($(templates['search-wrapper']())); // WAS {}
        self.setEventHandlers();
    })();

    return self;

}, rErrReport);