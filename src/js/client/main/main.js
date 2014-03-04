/* global isDev */
angular.module('aio.main').controller('MainCtrl', [
    '$scope', '$log', '$q', '$timeout', 'Apps', 'Config', 'Constants', 'Background', 'Analytics', 'Helpers',
    function ($scope, $log, $q, $timeout, Apps, Config, Constants, Background, Analytics, Helpers) {
        console.debug('[MainCtrl] - start v' + Constants.APP_VERSION + ' dev:' + isDev);
        var lazyCacheAppsTimeout;
        var checkConfigTimeout = 3000;

        $scope.firstBoot = false;

        $scope.refreshScope = function () {
            // $log.log('[MainCtrl] - Setting scope vars');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
            lazyCacheAppsTimeout = $scope.config.lazy_cache_dials_timeout;
        };

        var lazyCacheApps = function () {
            $timeout(function () {
                if (Apps.isCacheNeeded()) {
                    $log.log('[MainCtrl] - Initiating lazy cache for dial icons');
                    return Apps.lazyCacheIcons().then($scope.refreshScope);
                }
                // $log.log('[MainCtrl] - Apps already lazy cached.');
            }, lazyCacheAppsTimeout);
        };

        var lazyCheckConfig = function () {
            $timeout(function () {
                //check if config needs update
                if ($scope.config.updatedAt + $scope.config.config_expiration_time < Date.now()) {
                    $log.log('[MainCtrl] - config needs updating...');
                    return Helpers.loadRemoteJson($scope.config.config_update_url)
                        .then(Config.updateConfig)
                        .then(Apps.syncWebAppsDb)
                        .then($scope.refreshScope);
                }

                // $log.log('[MainCtrl] - config is up to date.');
            }, checkConfigTimeout);
        };

        var updateBackgroundPage = function () {
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                return;
            }
            var postObj = {
                setAccountData: Config.get()
            };
            chrome.runtime.sendMessage(postObj, angular.noop);
        };

        //second loading services
        var initializeApp = function () {
            $scope.firstBoot = false;
            return $q.all([$scope.refreshScope(), Analytics.init(), lazyCacheApps(), lazyCheckConfig()]);
        };

        var loadFromRemotes = function () {
            $scope.firstBoot = true;
            return Config.setup().then(Apps.setup).then(Background.setup).then(updateBackgroundPage);
        };

        var initBackground = function () {
            return Background.init().then(null, Background.setup);
        };

        //TODO get from settings
        $scope.displayTopSearchBox = 1;

        //set the scope overlay
        $scope.setOverlay = function (overlay) {
            $scope.overlay = {
                name: overlay
            };
        };

        var t0 = Date.now();
        //load configs from local
        $q.all([Config.init(), Apps.init()])
        //load background or from remotes if no local configs
        .then(initBackground, loadFromRemotes)
            .then(initializeApp)
            .then(function () {
                console.debug('[MainCtrl] - boot took ' + (Date.now() - t0) + ' ms.');
            });
    }
]);
