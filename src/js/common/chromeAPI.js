var chrome = angular.module('chrome', []);

chrome.factory('Chrome', [function(){
    return {
        management : {
            getAll : function(cb){
                if(chrome && chrome.management && chrome.management.getAll){
                    return chrome.management.getAll.apply(this, arguments);
                }else{
                    setTimeout(function(){
                        cb && cb();
                    },0);
                }
            }
        }
    }
}]);