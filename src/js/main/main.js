angular.module('aio.main').controller('MainCtrl', ['$scope', 'Apps', 'Config', '$log', 'Background', 'Analytics', '$q',
    function ($scope, Apps, Config, $log, Background, Analytics, $q) {

        console.debug('[MainCtrl] - init');
        var t0 = Date.now();

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

        var loadPhaseOne = function () {
            return $q.all([Config.init(), Background.init(), Apps.init()]);
        };

        var loadPhaseTwo = function () {
            return $q.all([init(), Analytics.init(), lazyCacheApps()]);
        };

        //load config from local or remote
        loadPhaseOne()
        //if apps setup is need
        .then(null, Apps.setup)
        //init scope vars
        .then(loadPhaseTwo)
        //report time
        .then(reportDone);

        //get from settings
        $scope.displayTopSearchBox = 1;

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
