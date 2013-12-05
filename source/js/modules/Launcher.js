function Launcher(renderer, chromeApps, topsites){
    var self = this;
    self.renderer = renderer;
    self.chromeApps = chromeApps;
    self.topsites = topsites;
}

Launcher.prototype.render = function(){
    //render wrapper
    var self = this;
    var html = templates['launcher-wrapper']();
    this.renderer.$$launcherWrapper.html(html);
    _.defer(_.bind(self.renderItems, self));
};


Launcher.prototype.renderItems = function(){
    //render wrapper
    var self = this;
    var html = "";

    _.each(self.topsites.topsites, function(site){
       if(site.screenshot)
        html += templates['launcher-dial'](site);
       else if(site.screenshotDefer){
           site.screenshotDefer.promise().done(function(){
               self.appendDial(site, true);
           })
       }
    });

    _.each(self.chromeApps.apps, function(app){
        html += templates['launcher-app'](app);
    });

    this.renderer.$$launcherWrapper.find('.inner').eq(0).html(html);
    self.setEventHandlers();
};


Launcher.prototype.appendDial = function(dial, prepend){
    //render wrapper
    var self = this;
    var html = templates['launcher-dial'](dial);
    if(prepend){
        this.renderer.$$launcherWrapper.find('.inner').eq(0).prepend(html);
    }else{
        this.renderer.$$launcherWrapper.find('.inner').eq(0).append(html);
    }

};

Launcher.prototype.setEventHandlers = function(){
    var self = this;
    self.renderer.$$launcherWrapper.on('click','.dial', _.bind(self.dialClickHandler, self));
    self.renderer.$$launcherWrapper.on('click','.dial-remove-button', _.bind(self.dialRemoveClickHandler, self));

    self.renderer.$$launcherWrapper.on('click','.app', _.bind(self.appClickHandler, self));
    self.renderer.$$launcherWrapper.on('click','.app-remove-button', _.bind(self.appRemoveClickHandler, self));

    self.renderer.$$launcherWrapper.on('click', _.bind(self.wrapperClickHandler, self));

};

Launcher.prototype.dialClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    var $target = $(e.currentTarget);
    window.location.href = $target.data('url');
};

Launcher.prototype.dialRemoveClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    var $target = $(e.currentTarget).parents('.dial').eq(0);;
    self.topsites.addToIgnored($target.data('url'));

    $target.fadeOut();
};


Launcher.prototype.appClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    var $target = $(e.currentTarget);
    var id = $target.data('id');
    chrome.management.launchApp(id, function(){});
};

Launcher.prototype.appRemoveClickHandler = function(e){
    var self = this;
    e.stopPropagation();
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


Launcher.prototype.wrapperClickHandler = function(e){
    var self = this;
    e.stopPropagation();
    console.log('self.renderer.$$wrapper',self.renderer.$$wrapper);
    self.renderer.$wrapper.toggleClass('launcher-maximized');
};







