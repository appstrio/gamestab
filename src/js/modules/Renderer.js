define(['promise!async_config','jquery','templates'], function Renderer(config,jquery,templates) {
    var self = {};

    self.$wrapper = $('#wrapper');
    self.config = config.config;

    self.$$layout = $(templates['classic']());
    self.$$searchWrapper = self.$$layout.find('.search-wrapper').eq(0);

    self.applyClassic = function() {
      self.$wrapper.html(self.$$layout);
    }
    return self;
});