var isWebsite = true;

angular.module('aio.settings', []);
angular.module('aio.search', []);
angular.module('aio.launcher', []);
angular.module('aio.common', [
    'aio.common.helpers', 'aio.chrome', 'aio.file', 'aio.image', 'aio.interactions',
    'aio.overlay', 'aio.storage', 'aio.analytics', 'communications'
]);
angular.module('aio.main', []);

angular.module('myApp', ['aio.main', 'aio.settings', 'ui.sortable',
    'aio.common', 'aio.launcher', 'aio.search', 'fallback.src', 'ngProgress'
]);

//use cross domain requests - needed if website
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
