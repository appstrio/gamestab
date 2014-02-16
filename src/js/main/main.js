angular.module('aio.main').controller('MainCtrl', ['$scope', 'Apps', 'Config', '$log', 'Background', 'Analytics', '$q',
    function ($scope, Apps, Config, $log, Background, Analytics, $q) {

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
        $q.all([Config.init(), Background.init()])
        //init dials
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
