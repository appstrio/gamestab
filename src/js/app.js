var app = angular.module('myApp', ['aio.settings', 'ui.sortable', 'aio.common', 'aio.launcher', 'aio.search']);

//first boot angular
angular.element(document).ready(function () {
    //bootstrap
    angular.bootstrap(document, ['myApp']);
});
