var searchModule = angular.module('search', []);

searchModule.directive('aioSearchBox', [function(){
    return function(scope,element,attrs){
        element.focus();
    }
}]);