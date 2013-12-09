require.config({
    baseUrl: 'js/',
    // waitSeconds: 30,
    paths: {
        promise: 'libs/requirejs-promise',
        underscore: 'libs/underscore-min',
        jquery: 'libs/jquery.min',
        moment: 'libs/moment.min',
        env: 'env',
        boot: 'boot',
        templates: 'templates',
        analytics: 'modules/analytics',
        async_chromeapps: 'modules/async_chromeapps',
        classiclauncher: 'modules/classiclauncher',
        async_config: 'modules/async_config',
        async_filesystem: 'modules/async_filesystem',
        geo: 'modules/geo',
        launcher: 'modules/launcher',
        news: 'modules/news',
        renderer: 'modules/renderer',
        async_runtime: 'modules/async_runtime',
        async_screenshot: 'modules/async_screenshot',
        search: 'modules/search',
        storage: 'modules/storage',
        async_topsites: 'modules/async_topsites',
        weather: 'modules/weather'
    }
});

define(['boot', 'promise!async_filesystem', 'promise!async_screenshot', 'promise!async_topsites', 'promise!async_runtime', 'weather', 'news', 'renderer', 'launcher', 'classiclauncher', 'search', 'analytics'], function(boot, fs, screenshot, topsites, runtime, weather, news, renderer, launcher, classiclauncher, search, analytics) {

    var self = {};

    self.render = function() {
        news.render();
        weather.render();

        launcher.render();
        search.render();
        renderer.apply();
        window.analytics = analytics;
        _.defer(boost);
    };

    self.renderClassic = function() {
        search.render();
        classiclauncher.render();
        renderer.applyClassic();
        window.analytics = analytics;
        _.defer(boost);
    };

    self.boost = function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.update(tab.id, {
                selected: true
            }, function() {
                $('.search-input').blur().focus();
            });
        });
    }

    if (!boot.useboosterq) {
        self.renderClassic();
    }
});
