angular.module('aio.main').controller('MainCtrl', [
    '$scope', 'Apps', 'Config', '$log', 'Constants', 'Background', 'Analytics', '$q', '$timeout', 'Helpers',
    function ($scope, Apps, Config, $log, Constants, Background, Analytics, $q, $timeout, Helpers) {

        console.debug('[MainCtrl] - init with version', Constants.APP_VERSION);
        var lazyCacheAppsTimeout = Constants.CONFIG.lazy_cache_dials_timeout;
        var checkConfigTimeout = 3000;
        var t0 = Date.now();

        $scope.refreshScope = function () {
            $log.log('[MainCtrl] - Setting scope vars');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        var lazyCacheApps = function () {
            $timeout(function () {
                $log.log('[MainCtrl] - Apps already lazy cached.');
                if (Apps.isCacheNeeded()) {
                    $log.log('[MainCtrl] - Initiating lazy cache for dial icons');
                    return Apps.lazyCacheIcons().then($scope.refreshScope);
                }
            }, lazyCacheAppsTimeout);
        };

        var checkConfigExpiration = function () {
            $timeout(function () {
                //check if config needs update
                if ($scope.config.updatedAt + $scope.config.config_expiration_time < Date.now()) {
                    $log.log('[MainCtrl] - config needs updating...');
                    return Helpers.loadRemoteJson($scope.config.config_update_url)
                        .then(Config.updateConfig)
                        .then(Apps.syncWebAppsDb)
                        .then($scope.refreshScope);
                }

                $log.log('[MainCtrl] - config is up to date.');
            }, checkConfigTimeout);
        };

        var updateBackgroundPage = function () {
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                return;
            }
            chrome.runtime.sendMessage({
                setAccountData: Config.get()
            }, angular.noop);
        };

        //second loading services
        var initializeApp = function () {
            $log.info('✔ [MainCtrl] - Start phase two');
            return $q.all([$scope.refreshScope(), Analytics.init(), lazyCacheApps(), checkConfigExpiration()]);
        };

        var loadFromRemotes = function () {
            return Config.setup().then(Apps.setup).then(Background.setup).then(updateBackgroundPage);
        };

        var getBackgroundSequence = function () {
            return Background.init().then(null, Background.setup);
        };

        //load config from local or remote
        $q.all([Config.init(), Apps.init()])
            .then(getBackgroundSequence, loadFromRemotes)
            .then(initializeApp)
            .then(function () {
                console.debug('%c✔[MainCtrl] - entire startup process took ' +
                    (Date.now() - t0) + ' ms.', 'background:black;color:yellow;');
            });

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
