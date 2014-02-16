angular.module('aio.main').controller('MainCtrl', ['$scope', '$http', 'Apps', 'Config', '$log', 'Background', 'Analytics',
    function ($scope, $http, Apps, Config, $log, Background, Analytics) {

        //get from settings
        $scope.displayTopSearchBox = 1;

        var init = function () {
            $log.log('[MainCtrl] - Apps finished loading. Organizing dials');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        console.debug('[MainCtrl] - init');
        var t0 = Date.now();
        //load config from local or remote
        Config.init()
        //load background from local or remote
        .then(Background.init)
        //load apps from local or remote
        .then(Apps.init)
        //assign main ctrl scope vars
        .then(init)
        //load analytics scripts
        .then(Analytics.init)
        //detect if app icons need lazy cache
        .then(function () {
            if (Apps.isCacheNeeded()) {
                return Apps.lazyCacheIcons();
            }
        })
        //detect if background images need lazy cache
        .then(function () {
            if (Background.isCacheNeeded()) {
                return Background.lazyCacheImages();
            }
        })
        //report time
        .then(function () {
            console.debug('%c[MainCtrl] - entire startup process took ' + (Date.now() - t0) + ' ms.', 'background:black;color:yellow;');
        });

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
