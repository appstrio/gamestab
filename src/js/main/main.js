angular.module('aio.main').controller('MainCtrl', ['$scope', 'Apps', 'Config', '$log', 'Background', 'Analytics', '$q',
    function ($scope, Apps, Config, $log, Background, Analytics, $q) {

        console.debug('[MainCtrl] - init');
        var t0 = Date.now();
        //get from settings
        $scope.displayTopSearchBox = 1;

        var init = function () {
            $log.log('[MainCtrl] - Setting scope vars');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        var lazyCacheApps = function () {
            if (Apps.isCacheNeeded()) {
                return Apps.lazyCacheIcons();
            }
        };

        var reportDone = function () {
            console.debug('%c[MainCtrl] - entire startup process took ' +
                (Date.now() - t0) + ' ms.', 'background:black;color:yellow;');
        };

        //load config from local or remote
        $q.all([Config.init(), Background.init(), Apps.init()])
        //if apps setup is need
        .then(null, Apps.setup)
        //init scope vars
        .then(init)
        //load analytics scripts
        .then(Analytics.init)
        //detect if app icons need lazy cache
        .then(lazyCacheApps)
        //report time
        .then(reportDone);

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
