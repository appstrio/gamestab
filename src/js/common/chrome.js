var chromeModule = angular.module('aio.chrome', []);

chromeModule.factory('Chrome', ['$rootScope','$timeout', function($rootScope, $timeout){
    return {
        management : {
            getAll : function(cb){
                if(chrome && chrome.management && chrome.management.getAll){
                    return chrome.management.getAll(function(output){
                       $rootScope.$apply(function(){
                            cb && cb(output);
                       });
                    });
                }else{
                    $timeout(cb,0);
                }
            }
        }
    }
}]);