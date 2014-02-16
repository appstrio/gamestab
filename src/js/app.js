angular.module('aio.settings', []);
angular.module('aio.search', []);
angular.module('aio.launcher', []);
angular.module('aio.common', [
    'aio.chrome', 'aio.file', 'aio.image', 'aio.interactions', 'aio.overlay', 'aio.storage', 'aio.analytics'
]);
angular.module('aio.main', []);

/*
 * main module
 */
angular.module('myApp', ['aio.main', 'aio.settings', 'ui.sortable', 'aio.common', 'aio.launcher', 'aio.search']);

//first boot angular
angular.element(document).ready(function () {
    //bootstrap
    angular.bootstrap(document, ['myApp']);
});
