define(['underscore', 'renderer', 'promise!async_chromeapps', 'promise!async_topsites'], function Launcher(underscore, renderer, chromeapps, topsites) {
    var self = {};
    self.renderer = renderer;
    self.chromeapps = chromeapps;
    self.topsites = topsites;

    self.render = function() {
        //render wrapper
        var html = templates['launcher-wrapper']();
        this.renderer.$$launcherWrapper.html(html);
        _.defer(_.bind(self.renderItems, self));
    };


    self.renderItems = function() {
        //render wrapper
        var html = "";

        _.each(self.topsites.topsites, function(site) {
            if (site.screenshot)
                html += templates['launcher-dial'](site);
            else if (site.screenshotDefer) {
                site.screenshotDefer.promise().done(function() {
                    self.appendDial(site, true);
                })
            }
        });

        _.each(self.chromeapps.apps, function(app) {
            html += templates['launcher-app'](app);
        });

        this.renderer.$$launcherWrapper.find('.inner').eq(0).html(html);
        self.setEventHandlers();
    };


    self.appendDial = function(dial, prepend) {
        //render wrapper
        var html = templates['launcher-dial'](dial);
        if (prepend) {
            this.renderer.$$launcherWrapper.find('.inner').eq(0).prepend(html);
        } else {
            this.renderer.$$launcherWrapper.find('.inner').eq(0).append(html);
        }

    };

    self.setEventHandlers = function() {
        self.renderer.$$launcherWrapper.on('click', '.dial', _.bind(self.dialClickHandler, self));
        self.renderer.$$launcherWrapper.on('click', '.dial-remove-button', _.bind(self.dialRemoveClickHandler, self));

        self.renderer.$$launcherWrapper.on('click', '.app', _.bind(self.appClickHandler, self));
        self.renderer.$$launcherWrapper.on('click', '.app-remove-button', _.bind(self.appRemoveClickHandler, self));

        self.renderer.$$launcherWrapper.on('click', _.bind(self.wrapperClickHandler, self));

    };

    self.dialClickHandler = function(e) {
        e.stopPropagation();
        var $target = $(e.currentTarget);
        window.location.href = $target.data('url');
    };

    self.dialRemoveClickHandler = function(e) {
        e.stopPropagation();
        var $target = $(e.currentTarget).parents('.dial').eq(0);;
        self.topsites.addToIgnored($target.data('url'));

        $target.fadeOut();
    };


    self.appClickHandler = function(e) {
        e.stopPropagation();
        var $target = $(e.currentTarget);
        var id = $target.data('id');
        chrome.management.launchApp(id, function() {});
    };

    self.appRemoveClickHandler = function(e) {
        e.stopPropagation();
        var $target = $(e.currentTarget).parents('.app').eq(0);;
        var id = $target.data('id');
        chrome.management.uninstall(id, {
            showConfirmDialog: true
        }, function() {
            chrome.management.getAll(function(apps) {
                apps = apps || [];
                var found = _.findWhere(apps, {
                    id: id
                });
                if (!found) {
                    $target.fadeOut();
                }
            });

        });
    };

    self.wrapperClickHandler = function(e) {
        e.stopPropagation();
        console.log('self.renderer.$wrapper', self.renderer.$wrapper);
        self.renderer.$wrapper.toggleClass('launcher-maximized');
    };

    return self;
});
