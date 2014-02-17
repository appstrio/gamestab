angular.module('aio.main').controller('MainCtrl', [
    '$scope', 'Apps', 'Config', '$log', 'Constants', 'Background', 'Analytics', '$q', '$timeout',
    function ($scope, Apps, Config, $log, Constants, Background, Analytics, $q, $timeout) {

        console.debug('[MainCtrl] - init with version', Constants.APP_VERSION);
        var lazyCacheAppsTimeout = Constants.CONFIG.lazy_cache_dials_timeout;
        var t0 = Date.now();

        var init = function () {
            $log.log('[MainCtrl] - Setting scope vars');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        var lazyCacheApps = function () {
            $timeout(function () {
                $log.log('[MainCtrl] - Apps already lazy cached.');
                if (Apps.isCacheNeeded()) {
                    $log.log('[MainCtrl] - Initiating lazy cache for dial icons');
                    return Apps.lazyCacheIcons();
                }
            }, lazyCacheAppsTimeout);
        };

        var reportDone = function () {
            console.debug('%c[MainCtrl] - entire startup process took ' +
                (Date.now() - t0) + ' ms.', 'background:black;color:yellow;');
        };

        var loadPhaseOne = function () {
            $log.info('[MainCtrl] - Start phase one');
            return $q.all([Config.init(), Background.init(), Apps.init()]);
        };

        var loadPhaseTwo = function () {
            $log.info('[MainCtrl] - Start phase two');
            return $q.all([init(), Analytics.init(), lazyCacheApps()]);
        };

        //load config from local or remote
        loadPhaseOne()
        //if apps setup is needed
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
