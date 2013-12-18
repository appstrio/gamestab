define(['underscore', 'jquery', 'templates', 'when'], function Renderer(_, $, templates, when) {

    // (0) general settings
    var self = {};


    // (1) setup the general layout
    self.$wrapper = $('#wrapper');
    self.$layout = $(templates['classic']());

    // setup general layout
    self.$wrapper.html(self.$layout);


    //  (2) widely used dom selectors
    self.$searchWrapper = self.$layout.find('.search-wrapper').eq(0);

    //self.$pages = {
    self.pages = {
        $dials: self.$wrapper.find('.page0').eq(0),
        $apps: self.$wrapper.find('.page1').eq(0)
    };

    self.switches = {
        $dials: $('.dials-switch'),
        $apps: $('.apps-switch')
    };

    self.overlays = {
        $webAppsOverlay : $('.web-apps-overlay')
    };

    self.$webAppsOverlayBtn = $('.web-apps-overlay-btn');
    self.$fadescreen = $('#overlays');






    // (3) rendering functions
    /**
     *
     * @param template
     * @param providerObject
     * @returns {{maxDials: number, fadeOutSpeed: number}}
     */
    self.renderDialsArr = function renderDials(providerObject, parentSelector, options) {
        var $parent = $(parentSelector), options = options || {};
        //Clean dials zone
        $parent.html('');

        providerObject.provide().then(function(dials) {
            var maxDials = options.maxDials || dials.length;
            for (var i = 0; i < dials.length && i < maxDials; i++) {
                var dial = dials[i];
                self.renderDial($parent, dial);
            };
        });
        return self;
    }


    /**
     *
     * @param $parent
     * @param dial
     * @returns {void|*}
     */

    self.renderDial = function($parent, dial) {
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

        return $parent.append($dial);
    };



    self.removeDialElement = function($ele) {
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






    // (4) event handlers
        var switchHandler = function function_name(name) {
            return function() {
                //Remove highlighting from all switches and highlight the selected one
                _.each(self.switches, function($swi) {$swi.removeClass('selected');});
                $('.switch').removeClass();
                self.switches[name].addClass('selected');
                //Show only the selected page
                _.each(self.pages, function($page) {$page.hide() });
                self.pages[name].show();
            }
        };





    var openOverlayHandler = function function_name(name) {
            return function() {
                //Show only the selected page
                _.each(self.overlays, function($ol) {$ol.hide()});
                self.$fadescreen.removeClass('hide');
                self.$fadescreen.fadeIn();
                console.log('self.overlays[name]',self.overlays[name]);
                self.overlays[name].show();
            }
    };



    var closeOverlayHandler = function function_name() {
        _.each(self.overlays, function($ol) {$ol.hide()});
        self.$fadescreen.fadeOut(function(){
            self.$fadescreen.addClass('hide');
        });
    }





    // (5) Build the DOM and assign event hadnlers
    // setup search layout
    self.$searchWrapper.html($(templates['search-wrapper']()));
    //Event handlers
    self.switches.$apps.on ('click', switchHandler('$apps'));
    self.switches.$dials.on('click', switchHandler('$dials'));
    self.$webAppsOverlayBtn.on ('click', openOverlayHandler('$webAppsOverlay'));
    self.$fadescreen.on ('click', closeOverlayHandler);

    return self;

}, rErrReport);
