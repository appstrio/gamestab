var searchModule = angular.module('aio.search', []);

searchModule.directive('aioSearchBox', [

    function () {
        return function (scope, element, attrs) {
            element.focus();
        };
    }
]);
