angular.module('aio.main').controller('MainCtrl', [
    '$scope', 'Apps', 'Config', '$log', 'Constants', 'Background', 'Analytics', '$q', '$timeout', 'Helpers',
    function ($scope, Apps, Config, $log, Constants, Background, Analytics, $q, $timeout, Helpers) {

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
                    return Apps.lazyCacheIcons().then(init);
                }
            }, lazyCacheAppsTimeout);
        };

        var reportDone = function () {
            console.debug('%c✔[MainCtrl] - entire startup process took ' +
                (Date.now() - t0) + ' ms.', 'background:black;color:yellow;');
        };

        //first loading services
        var loadFromStorage = function () {
            $log.info('✔ [MainCtrl] - Start phase one');
            return $q.all([Config.init(), Background.init(), Apps.init()]);
        };

        var checkConfigExpiration = function () {
            //check if config needs update
            if ($scope.config.updatedAt + $scope.config.config_expiration_time < Date.now()) {
                $log.log('[MainCtrl] - config needs updating...');
                return Helpers.loadRemoteJson($scope.config.config_update_url).then(Config.updateConfig);
            }

            $log.log('[MainCtrl] - config is up to date.');
            return;
        };

        //second loading services
        var initializeApp = function () {
            $log.info('✔ [MainCtrl] - Start phase two');
            return $q.all([init(), Analytics.init(), lazyCacheApps(), checkConfigExpiration()]);
        };

        var loadFromRemotes = function () {
            return $q.all([Config.setup(), Background.setup()]).then(Apps.setup);
        };

        //load config from local or remote
        loadFromStorage()
            .then(null, loadFromRemotes)
            .then(initializeApp)
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
