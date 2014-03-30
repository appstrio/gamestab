angular.module('aio.main').controller('MainCtrl', [
    '$scope', '$log', '$q', '$timeout', 'Apps', 'Config', 'Constants', 'Background', 'Analytics', 'Helpers',
    function ($scope, $log, $q, $timeout, Apps, Config, Constants, Background, Analytics, Helpers) {
        console.debug('[MainCtrl] - start v' + Constants.APP_VERSION);
        var lazyCacheAppsTimeout;
        var checkConfigTimeout = 3000;

        $scope.firstBoot = false;

        $scope.useBlackText = function () {
            if ($scope.config && $scope.config.user_preferences.use_black_arrows) {
                return {
                    color: '#272842'
                };
            }
        };

        $scope.$watch(function () {
            return Apps.apps();
        }, function (newVal) {
            if (newVal && newVal.length) {
                $scope.rawScreens = Apps.apps();
            }
        }, true);

        $scope.refreshScope = function () {
            $scope.config = Config.get();
            lazyCacheAppsTimeout = $scope.config.lazy_cache_dials_timeout;
            $scope.displayTopSearchBox = $scope.config.user_preferences.show_search_box;
            watchPrefs();
        };

        var watchPrefs = _.once(function () {
            $scope.$watch('config.user_preferences', function (newVal) {
                if (newVal) {
                    $scope.refreshScope();
                }
            }, true);
        });

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
        var initApp = function () {
            //save state
            var _firstBoot = $scope.firstBoot || false;
            //turn off firstBoot state
            $scope.firstBoot = false;

            var analyticsParams = {
                devMode: false,
                firstBoot: _firstBoot,
                partnerId: Config.get().partner_id,
                analyticsId: Config.get().analytics_ua_account
            };
            return $q.all([$scope.refreshScope(), Analytics.init(analyticsParams), lazyCheckConfig()]);
        };

        var loadFromRemotes = function () {
            $scope.firstBoot = true;
            return Config.setup().then(Apps.setup).then(Background.setup).then(updateBackgroundPage);
        };

        var initBackground = function () {
            return Background.init().then(null, Background.setup);
        };

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
            .then(initApp)
            .then(function () {
                console.debug('[MainCtrl] - boot took ' + (Date.now() - t0) + ' ms.');
            });
    }
]);
