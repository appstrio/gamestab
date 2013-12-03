function ClassicLauncher(renderer, chromeApps, topsites){
    var self = this;
    self.renderer = renderer;
    self.chromeApps = chromeApps;
    self.topsites = topsites;
    self.$dialsWrapper = this.renderer.$$wrapper.find('.dials-wrapper').eq(0);
    self.$appsWrapper = this.renderer.$$wrapper.find('.apps-wrapper').eq(0);

    self.$appsSwitch = this.renderer.$$wrapper.find('.apps-switch').eq(0);
    self.$dialsSwitch = this.renderer.$$wrapper.find('.dials-switch').eq(0);
}

ClassicLauncher.prototype.render = function(){
    //render wrapper
    var self = this;
    var newDial;
    _.each(self.topsites.topsites, function(dial){
        self.renderDial(dial);
    });

    _.each(self.chromeApps.apps, function(app){
        self.renderApp(app);
    });


    self.setEventHandlers();
};


ClassicLauncher.prototype.renderDial = function(dial){
    var self = this;
    var newDial = $(templates['classic-dial'](dial));
    newDial.data('dial', dial);
    self.$dialsWrapper.append(newDial);
    if(dial.screenshotDefer && dial.screenshotDefer.promise){
        dial.screenshotDefer.promise().done(function(){
            newDial.find('.thumbnail-wrapper').css('background-image','url('+dial.screenshot+')');
        });
    }

};

ClassicLauncher.prototype.renderApp = function(app){
    var self = this;
    var newApp = $(templates['classic-app'](app));
    newApp.data('app', app);
    self.$appsWrapper.append(newApp);
};



ClassicLauncher.prototype.setEventHandlers = function(){
    var self = this;
    self.renderer.$$wrapper.on('click','.dial', _.bind(self.dialClickHandler, self));
    self.renderer.$$wrapper.on('click','.dial-remove-button', _.bind(self.dialRemoveClickHandler, self));

    self.renderer.$$wrapper.on('click','.app', _.bind(self.appClickHandler, self));
    self.renderer.$$wrapper.on('click','.app-remove-button', _.bind(self.appRemoveClickHandler, self));

    self.renderer.$$wrapper.on('click','.apps-switch', _.bind(self.appsSwitchClickHandler, self));
    self.renderer.$$wrapper.on('click','.dials-switch', _.bind(self.dialsSwitchClickHandler, self));

};

ClassicLauncher.prototype.dialClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    var $target = $(e.currentTarget);
    var url =   $target.data('url');

    if(window.analytics) window.analytics.sendEvent({category : 'Dials', action : 'Click', label : url}, function(){
        window.location.href = url;
    });

    setTimeout(function(){
        window.location.href = url;
    }, 500);



};

ClassicLauncher.prototype.dialRemoveClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    e.preventDefault();
    var $target = $(e.currentTarget).parents('.dial').eq(0);
    $target.fadeOut(function(){
        self.topsites.getAndAddNewDial(function(err, newDial){
            if(newDial){
                _.defer(function(){
                    self.renderDial(newDial);
                });

            }
        });
    });
    self.topsites.addToIgnored($target.data('url'));
};


ClassicLauncher.prototype.appClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    e.preventDefault();
    var $target = $(e.currentTarget);
    var id = $target.data('id');
    chrome.management.launchApp(id, function(){});
};

ClassicLauncher.prototype.appRemoveClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    e.preventDefault();
    var $target = $(e.currentTarget).parents('.app').eq(0);;
    var id = $target.data('id');
    chrome.management.uninstall(id,{showConfirmDialog : true}, function(){
        chrome.management.getAll(function(apps){
            apps = apps || [];
            var found = _.findWhere(apps, {id : id});
            if(!found){
                $target.fadeOut();
            }
        });

    });
};


ClassicLauncher.prototype.appsSwitchClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    e.preventDefault();

    self.$appsSwitch.addClass('selected');
    self.$dialsSwitch.removeClass('selected');

    self.$dialsWrapper.hide();
    self.$appsWrapper.show();
};

ClassicLauncher.prototype.dialsSwitchClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    e.preventDefault();

    self.$appsSwitch.removeClass('selected');
    self.$dialsSwitch.addClass('selected');

    self.$dialsWrapper.show();
    self.$appsWrapper.hide();
};




ClassicLauncher.prototype.wrapperClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    console.log('self.renderer.$$wrapper',self.renderer.$$wrapper);
    self.renderer.$wrapper.toggleClass('launcher-maximized');
};







