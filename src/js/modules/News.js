function News(renderer, weather, setup){
    var self = this;
        self.renderer = renderer;
        self.weather = weather;
        self.setup = setup;
        self.baseUrl = 'http://news.google.com?ned=';
        self.key = "news";
        self.storage = new MyStorage();

        self.countriesNEDS = {
            il : "iw_il",
            ar : "es_ar",
            au : "au",
            us : "us",
            be : "nl_be",
            br : "pt-BR_br",
            pt : "pt-PT_pt"

        };
};


News.prototype.getOrUpdate = function(done){
    if(!CONF.config.with_news) return done && done(true);

    var self = this;
    self.get(function(err, _news){
        if(err || !_news){
            self.updateNews(done);
        }else{
            done && done(null, _news);
        }
    })
};


News.prototype.get = function(done){
    if(!CONF.config.with_news) return done && done(true);

    var self = this;
    self.storage.get(self.key, function(result){
       if(!result){
           return done && done(true);
       }else{
            self.news = result[self.key];
            return done && done(null, self.news);
       }
    });
};

News.prototype.store = function(_news, done){
    var self = this;
    var objToStore = {};
    objToStore[self.key] = _news;
    self.storage.set(objToStore, done);
};


News.prototype.updateNews = function(done){
    var self = this;
        var country = self.setup.location.country.short_name.toLowerCase(), ned;
        var ned = self.countriesNEDS[country] || country || chrome.i18n.getMessage('@@ui_locale').toLowerCase();
        var url =  self.baseUrl + ned;

        $.ajax({
            type: "GET",
            url: url,
            success: function (_html) {
                var $html = $(_html), items = [];
                $html.find('.blended-wrapper').each(function(i){
                    items.push(self.parseBlendedWrapper(this));
                });

                self.news = items;
                self.store(self.news);
                done && done(null, self.news);

            },
            error:function(err){
                console.error('err',err);
            }
        });


};

News.prototype.parseBlendedWrapper = function(elm){
    var item = {
        title : '',
        niceDate : '',
        shortContent : '',
        content : '',
        from : [
            {name : ''}
        ],
        image : '',
        link : ''
    }

    item.title = $('.titletext', elm).eq(0).text();
    item.image = $('.esc-thumbnail-image', elm).attr('src');
    if(!item.image){
        item.image = $('.esc-thumbnail-image',elm).attr('imgsrc');
        if(item.image) item.image = "http:" + item.image;
    }

    if(item.image && item.image.indexOf('http:') !== 0 && item.image.indexOf('data') !== 0) item.image = "http:" + item.image;

    item.content = $('.esc-lead-snippet-wrapper', elm).text();
    item.shortContent = item.content
    if(item.shortContent.length > 100) item.shortContent = item.shortContent.slice(0,100);

    item.from[0] = {
        name : $('.al-attribution-source', elm).text()
    }
    item.niceDate = $('.al-attribution-timestamp', elm).text();
    item.link = $('a', elm).eq(0).attr('href');

    return item;
};


News.prototype.render = function(){
    var self = this;

    if(!self.renderer) return;

    if(!CONF.config.with_news){
        self.renderer.$wrapper.addClass('no-news');
        return;
    }
    var $wrapper = self.renderer.$$newsWrapper;
    var html = templates['news-wrapper']({ collection : self.news});
    $wrapper.html(html).removeClass('hide');
    self.setEventHandlers();
};

News.prototype.setEventHandlers = function(){
    var self = this;
    var $wrapper = self.renderer.$$newsWrapper;

    $wrapper.on('click','.item', _.bind(self.itemClickHandler, self));
};

News.prototype.itemClickHandler = function(e){
    var self = this;
    var $target = $(e.currentTarget);
    window.location.href= $target.data('link');
};