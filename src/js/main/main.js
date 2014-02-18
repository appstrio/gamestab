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

        //second loading services
        var initializeApp = function () {
            $log.info('✔ [MainCtrl] - Start phase two');
            return $q.all([init(), Analytics.init(), lazyCacheApps(), testConfig()]);
        };

        var testConfig = function () {
            $timeout(function () {
                Helpers.loadRemoteJson($scope.config.config_update_url).then(function (data) {
                    if (data && data.data) {
                        Config.updateConfig(data);
                    }
                });
            }, 4 * 1000);
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
