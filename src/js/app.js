var app = angular.module('myApp', ['ui.sortable', 'aio.common', 'aio.launcher','aio.search']);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['myApp']);
});