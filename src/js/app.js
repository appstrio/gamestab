var app = angular.module('myApp', ['aio.settings', 'ui.sortable', 'aio.common', 'aio.launcher', 'aio.search']);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['myApp']);
});
