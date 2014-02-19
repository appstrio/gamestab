angular.module('aio.settings', []);
angular.module('aio.search', []);
angular.module('aio.launcher', []);
angular.module('aio.common', [
    'aio.common.helpers', 'aio.chrome', 'aio.file', 'aio.image', 'aio.interactions',
    'aio.overlay', 'aio.storage', 'aio.analytics'
]);
angular.module('aio.main', []);

/*
 * main module
 */
angular.module('myApp', ['aio.main', 'aio.settings', 'ui.sortable',
    'aio.common', 'aio.launcher', 'aio.search', 'fallback.src', 'ngProgress'
]);

angular.module('myApp').config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

//first boot angular
angular.element(document).ready(function () {
    //bootstrap
    angular.bootstrap(document, ['myApp']);
});
