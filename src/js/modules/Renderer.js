define(['underscore', 'jquery', 'templates', 'when'], function Renderer(_, $, templates, when) {
    var self = {
        maxDials: 18,
        fadeOutSpeed: 400, // jQuery's default,
    };

    self.renderDial = function(location, dial) {
        var $dial = $(templates['classic-dial'](dial))
            .on('click', dial.click)
            .on('click', '.dial-remove-button', dial.remove);

        // Should be like this after
        // var $dial = $(templates['classic-dial'](dial))
        //     .on('click', dial.click)
        //     .on('remove', dial.remove);
        // $dial.on('click', '.dial-remove-button', $dial.remove);

        if (dial.id)
            $dial.data('id', dial.id);

        return self.$wrapper.find(location).append($dial);
    };

    self.removeDial = function($ele) {
        var removing = when.defer();
        $ele.fadeOut(self.fadeOutSpeed, removing.resolve);
        // removing.then(function (ele) {
        //One of those lines should work (not sure what .fadeOut returns)
        // ele.remove();
        // ele.remove();
        //
        // })
        return removing.promise;
    }
    var regular = ['apps', 'dials'],
        popups = ['plus'],
        makeSwitch = function function_name(name) {
            return function() {
                if (_.contains(popups, name)) {
                    $("#fadescreen").toggle();
                }
                //Remove highlighting from all switches and highlight the selected one
                _.each(self.$switches, function($swi) {$swi.removeClass('selected');}); // $("#fadescreen").hide(); // Needed?
                self.$switches[name].addClass('selected');
                //Show only the selected page
                _.each(self.$pages, function($page) {$page.hide() });
                self.$pages[name].show();
            }
        }


    self.dials = function renderDials(template, providerObject) {
        var provider, tpl;
        if (!providerObject)
            provider = template;
        else {
            tpl = template;
            provider = providerObject;
        };

        //Clean dial zone
        $(template).html('');

        provider.provide().then(function(dials) {
            for (var i = 0; i < dials.length && i < self.maxDials; i++) {
                var dial = dials[i];
                self.renderDial(template, dial);
            };
        });
        return self;
    }

    self.$wrapper = $('#wrapper');
    // setup generel layout
    self.$layout = $(templates['classic']());
    self.$wrapper.html(self.$layout);

    self.$switches = {
        dials: $('.apps-switch'),
        apps: $('.dials-switch'),
        plus: $('#plus.switch'),
    }
    self.$pages = {
        dials: self.$wrapper.find('.page0').eq(0),
        apps: self.$wrapper.find('.page1').eq(0),
        plus: $(".popups #plus").eq(0),
    }

    $.extend(self, {
        $searchWrapper: self.$layout.find('.search-wrapper').eq(0),
        $appsSwitch: self.$wrapper.find('.apps-switch').eq(0),
        $dialsSwitch: self.$wrapper.find('.dials-switch').eq(0),
    });
    // setup search layout
    self.$searchWrapper.html($(templates['search-wrapper']())); // WAS {}
    //Event handlers
    self.$switches.apps.on ('click', makeSwitch('apps'));
    self.$switches.dials.on('click', makeSwitch('dials'));
    self.$switches.plus.on ('click', makeSwitch('plus'));

    return self;

}, rErrReport);
