angular.module('myApp', ['aio.main', 'aio.settings', 'ui.sortable', 'aio.common', 'aio.launcher', 'aio.search']);

//first boot angular
angular.element(document).ready(function () {
    //bootstrap
    angular.bootstrap(document, ['myApp']);
});
