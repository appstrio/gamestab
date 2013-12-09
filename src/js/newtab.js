define(['promise!async_filesystem', 'promise!async_screenshot', 'promise!async_topsites', 'promise!async_chromeApps', 'promise!async_runtime', 'weather', 'news', 'renderer', 'launcher', 'classicLauncher', 'search', 'analytics'], function(fs, screenshot, topsites, chromeApps, runtime, weather, news, renderer, launcher, classicLauncher, search, analytics) {

    var self = {};

    self.render = function(){
        news.render();
        weather.render();

        launcher.render();
        search.render();
        renderer.apply();
        window.analytics = analytics = new Analytics(runtime);
        _.defer(boost);
    };

    self.renderClassic = function(){
        search.render();
        classicLauncher.render();
        renderer.applyClassic();
        window.analytics = analytics = new Analytics(runtime);
        _.defer(boost);
    };

    self.boost = function(){
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.update(tab.id, {selected:true}, function(){
                $('.search-input').blur().focus();
            });
        });
    }

    if(!USE_BOOSTER){
        self.renderClassic();
    }
});
