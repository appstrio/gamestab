function Renderer(setup){
    var self = this;

    self.$wrapper = $('#wrapper');
    self.config = MY_CONFIG.config;
    self.setup  = setup;

    if(!MY_CONFIG.config.classic_layout){
        self.$$wrapper = $(templates['wrapper']({}));
        self.$$searchWrapper = self.$$wrapper.find('.search-wrapper').eq(0);
        self.$$launcherWrapper = self.$$wrapper.find('.launcher-wrapper').eq(0);
        self.$$newsWrapper = self.$$wrapper.find('.news-wrapper').eq(0);
        self.$$weatherWrapper = self.$$wrapper.find('.weather-wrapper').eq(0);
        self.$$titleWrapper = self.$$wrapper.find('.title-wrapper').eq(0);
    }else{
        self.$$wrapper = $(templates['classic']());
        self.$$searchWrapper = self.$$wrapper.find('.search-wrapper').eq(0);
    }

    self.clockInterval = null;
};


Renderer.prototype.apply = function(){
    var self = this;
    self.$wrapper.html(self.$$wrapper);
    if(!MY_CONFIG.config.classic_layout) _.defer(_.bind(self.renderTitle, self));
};

Renderer.prototype.applyClassic = function(){
    var self = this;
    self.$wrapper.html(self.$$wrapper);
    if(!MY_CONFIG.config.classic_layout) _.defer(_.bind(self.renderTitle, self));
};



Renderer.prototype.renderTitle = function(title){
    var self = this;
    clearInterval(self.clockInterval);

    var title = title || {};
    if(!title.title){
        title.title = (self.setup.location && self.setup.location.city ) ? self.setup.location.city.short_name : 'Today';
    }
    var html = templates['title-wrapper'](title);
    self.$$titleWrapper.html(html);

    self.$$titleWrapper.find('span.date').text(moment().format('dddd[,] MMMM DD[,] '));
    self.runClock();
};


Renderer.prototype.runClock = function(){
    var self = this;
    var updateClock = function(){
        self.$$titleWrapper.find('span.clock').text(moment().format('HH[:]mm[:]ss'));
    }
    updateClock();
    self.clockInterval = setInterval(updateClock,1000);
};




