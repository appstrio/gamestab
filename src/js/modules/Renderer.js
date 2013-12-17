define(['jquery', 'templates', 'when'], function Renderer($, templates, when) {
    var self = {
        maxDials:18,
        fadeOutSpeed: 400, // jQuery's default,
    };

    self.renderDial = function (location, dial) {
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click)
            .on('click', '.dial-remove-button', dial.remove);

        // Should be like this after
        // var $dial = $(templates['classic-dial'](dial))
        //     .on('click', dial.click)
        //     .on('remove', dial.remove);
        // $dial.on('click', '.dial-remove-button', $dial.remove);

        if(dial.id)
            $dial.data('id',dial.id);

        return self.$wrapper.find(location).append($dial);
    };

    self.removeDial = function ($ele) {
        var removing = when.defer();
        $ele.fadeOut(self.fadeOutSpeed, removing.resolve);
        // removing.then(function (ele) {
            //One of those lines should work (not sure what .fadeOut returns)
            // ele.remove();
            // $ele.remove();
        // })
        return removing.promise;
    }

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
            tpl      = template;
            provider = providerObject;
        };

        //Clean dial zone
        $(template).html('');

        provider.provide().then(function (dials) {
            for (var i =  0; i < dials.length && i < self.maxDials; i++) {
                var dial = dials[i];
                self.renderDial(template, dial);
            };
        });
        return self;
    }



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

    return self;

}, rErrReport);