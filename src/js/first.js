'use strict';
var app = {}
app.env = 'PRODUCTION';

CONF = Config().config;
USE_BOOSTER = false;

var useBooster = function(){
    return (CONF.config.booster_enabled && CONF.config.with_booster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1);
};


CONF.init(function(config){
    if(useBooster()){
        window.open("newtab.html#newtab");
        window.close();
        USE_BOOSTER = true;
    }else{
    }
});