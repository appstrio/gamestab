define(['async_config'], function Renderer(config) {
    var self = {};

    self.$wrapper = $('#wrapper');
    self.config = CONF.config;

    self.$$layout = $(templates['classic']());
    self.$$searchWrapper = self.$$layout.find('.search-wrapper').eq(0);

    self.applyClassic = function() {
      self.$wrapper.html(self.$$layout);
    }
    return self;
});