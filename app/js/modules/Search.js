function Search(renderer, setup){
    var self = this;
    var config = MY_CONFIG.config;

    self.setup = setup;
    self.cc = self.setup.setup.location.country.short_name;
    self.renderer = renderer;
    self.base_search_url = config.base_search_url;
    self.base_suggestions_url = config.base_suggestions_url;

};

Search.prototype.render = function(){
    var self = this;
    var searchWrapperInnerHTML = $(templates['search-wrapper']({}));
    self.renderer.$$searchWrapper.html(searchWrapperInnerHTML);

    _.defer(_.bind(self.setEventHandlers, self));
    _.defer(_.bind(self.setupTypeahead, self));

};

Search.prototype.setEventHandlers = function(){
    var self = this;
    self.renderer.$$searchWrapper.on('click','.submit-button', function(e){
        var query = self.renderer.$$searchWrapper.find('input').eq(0).val();

        self.doSearch(query);

    });

};

Search.prototype.setupTypeahead = function(){
    var self = this;
    var input = self.renderer.$$searchWrapper.find('.search-input').eq(0);
    input.typeahead({
        source : _.bind(self.getSuggestions, self),
        updater : function(item){
            self.doSearch(item);
        }
    });
};


Search.prototype.getSuggestions = function(query, process){
    var self = this;

    var url  =  self.base_suggestions_url + query;

    $.ajax({
        method : "GET",
        url : url,
        success : function(xml){
            var results = $(xml).find('suggestion'), current, output=[];
            for (var i = 0; i < 3, i < results.length; ++i){
                current = results[i];
                output.push($(current).attr('data'));
            }

            if(output[0] !== query) output.unshift(query);

            process(output);
        },
        dataType : 'xml'

    });

};


Search.prototype.doSearch = function(query){
    var self = this;
    if(common.isUrl(query)){
        self.redirectToUrl(query);
    }else{
        self.redirectToSearch(query);
    }
}


Search.prototype.redirectToUrl = function(url){

    if(url.indexOf('http://') !== 0)url = 'http://' + url;

    if(window.analytics) window.analytics.sendEvent({category : 'Search', action : 'Url', label : url, value : 0}, function(){
        window.location.href = url;
    });

    setTimeout(function(){
        window.location.href = url;
    }, 500);

};

Search.prototype.redirectToSearch = function(query){
    var self = this;
    var val = window.analytics.getEventValue(self.cc);

    if(window.analytics) window.analytics.sendEvent({category : 'Search', action : 'Search', label : query, value : val}, function(){
        window.location.href = self.base_search_url + query;
    });

    setTimeout(function(){
        window.location.href = self.base_search_url + query;
    }, 500);

};

