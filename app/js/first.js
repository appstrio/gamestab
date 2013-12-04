MY_CONFIG = new Config();
USE_BOOSTER = false;

var useBooster = function(){
    return (MY_CONFIG.config.booster_enabled && MY_CONFIG.config.with_booster && document.URL.indexOf('#newtab') === -1 && document.URL.indexOf('background') === -1);
};

MY_CONFIG.init(function(config){
    if(useBooster()){
        window.open("newtab.html#newtab");
        window.close();
        USE_BOOSTER = true;
    }else{
    }

});