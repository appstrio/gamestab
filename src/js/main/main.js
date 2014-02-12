var mainModule = mainModule || angular.module('aio.main', []);
mainModule.controller('MainCtrl', ['$scope', '$http', 'Apps', 'Config', '$log', 'Background', 'Analytics',
    function ($scope, $http, Apps, Config, $log, Background, Analytics) {

        //get from settings
        $scope.displayTopSearchBox = 1;

        $scope.init = function () {
            $log.log('[MainCtrl] - Apps finished loading. Organizing dials');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        console.debug('[MainCtrl] - init');
        //load config from local or remote
        Config.init()
        //load apps from local or remote
        .then(Apps.init)
        //assign main ctrl scope vars
        .then($scope.init)
        //load analytics scripts
        .then(Analytics.init)
        //load background from local or remote
        .then(Background.init)
        //now lazy cache app icons
        .then(Apps.lazyCacheIcons);

        /**
         * setOverlay
         * Sets the scope overlay
         *
         * @param overlay
         * @return
         */
        $scope.setOverlay = function (overlay) {
            $scope.overlay = {
                name: overlay
            };
        };
    }
]);
