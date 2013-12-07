function Renderer(setup){
    var self = this;

    self.$wrapper = $('#wrapper');
    self.config = MY_CONFIG.config;
    self.setup  = setup;

    self.$$layout = $(templates['classic']());
    self.$$searchWrapper = self.$$layout.find('.search-wrapper').eq(0);
};



Renderer.prototype.applyClassic = function(){
    var self = this;
    self.$wrapper.html(self.$$layout);
};




