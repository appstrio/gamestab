(function(){

    var fs, screenshot, topsites, chromeApps, setup, weather, news, renderer, launcher, classicLauncher, search, analytics;

    var boot = function(){
        fs = new FileSystem(function(err){
            if(err){

            }

            setup = new Setup(function(err, _setupObject){
                renderer = new Renderer(_setupObject);
                screenshot = new Screenshot(fs, function(){
                    topsites = new Topsites(screenshot, function(){
                        chromeApps = new ChromeApps(function(){
                            launcher = new Launcher(renderer, chromeApps, topsites);
                            search = new Search(renderer, setup);
                            weather = new Weather(renderer, _setupObject);
                            weather.get({},function(err, weather){
                                news = new News(renderer, weather,  _setupObject);
                                news.getOrUpdate(function(){
                                    render();
                                })
                            });
                        });
                    });
                });

            });

        });
    };

    var bootClassic = function(){
        fs = new FileSystem(function(err){
            if(err){

            }

            setup = new Setup(function(err, _setupObject){
                renderer = new Renderer(_setupObject);
                screenshot = new Screenshot(fs, function(){
                    topsites = new Topsites(screenshot, function(){
                        chromeApps = new ChromeApps(function(){
                            classicLauncher = new ClassicLauncher(renderer, chromeApps, topsites);
                            search = new Search(renderer, setup);
                            renderClassic();
                        });
                    });
                });

            });

        });
    };


    var render = function(){
        news.render();
        weather.render();

        launcher.render();
        search.render();
        renderer.apply();
        window.analytics = analytics = new Analytics(setup);
        _.defer(boost);
    };

    var renderClassic = function(){
        search.render();
        classicLauncher.render();
        renderer.applyClassic();
        window.analytics = analytics = new Analytics(setup);
        _.defer(boost);
    };


    var boost = function(){
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.update(tab.id, {selected:true}, function(){
                $('.search-input').blur().focus();
            });
        });
    }

    if(!USE_BOOSTER){
        if(MY_CONFIG.config.classic_layout){
            bootClassic();
        }else{
            boot();
        }

    }
})();
