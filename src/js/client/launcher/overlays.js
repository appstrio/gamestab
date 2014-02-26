/* global _ */
angular.module('aio.launcher').controller('SettingsCtrl', ['$scope', 'Constants', 'Analytics', 'Config',
    function ($scope, C, Analytics, Config) {
        $scope.panes = ['General', 'Background', 'About'];
        //initial selected pane
        $scope.selectedPane = 'General';
        //get version for display
        $scope.clientVersion = C.APP_VERSION;
        //set scope config
        $scope.config = Config.get();

        $scope.toggleShowSearch = function () {
            //report analytics
            Analytics.reportEvent(703, {
                label: $scope.config.user_preferences.show_search_box
            });

            //store settings
            Config.set();
        };

        /**
         * selectPane
         * When user selects a pane in the settings overlay
         *
         * @param pane
         * @param e
         * @return
         */
        $scope.selectPane = function (pane, e) {
            e.stopPropagation();
            $scope.selectedPane = pane;
            Analytics.reportEvent(702, {
                label: pane
            });
        };
    }
]).controller('BackgroundCtrl', ['$scope', 'Background', 'Analytics', 'ngProgress',
    function ($scope, Background, Analytics, ngProgress) {

        $scope.loading = true;
        ngProgress.start();

        //assign scope backgrounds
        Background.isReady.then(Background.fetchBackgrounds)
            .then(function () {
                ngProgress.complete();
                $scope.loading = false;
                $scope.refreshBackgrounds();

                $scope.isActiveBg = function (bg) {
                    return Background.background.originalUrl === bg.originalUrl ? 'selected' : '';
                };
            });

        $scope.refreshBackgrounds = function () {
            console.debug('refreshing backgrounds');
            $scope.backgrounds = Background.getBackgrounds();
        };

        /**
         * selectBackground
         * User selects a background
         *
         * @param bg
         * @param e
         * @return
         */
        $scope.selectBackground = function (bg, e) {
            e.stopPropagation();
            //report analytics
            if (!bg.url || bg.url === Background.background.url) {
                return;
            }

            $scope.loading = true;

            Analytics.reportEvent(704, {
                label: bg.originalUrl || bg.url
            });

            Background.setNewBackground(bg).then(function () {
                //assign the new url to the image
                $scope.loading = false;
            });
        };
    }
]).controller('StoreCtrl', ['$scope', 'Apps', '$log', 'Analytics',
    function ($scope, Apps, $log, Analytics) {
        var byTags = {}, flattenedApps = [],
            allApps = [];

        $scope.tags = ['Featured', 'Games', 'Social', 'News & Weather', 'Shopping', 'Productivity'];
        //default starting tag
        $scope.selectedTag = 'Featured';

        var setFlattenedApps = function (_apps) {
            _apps = _apps || flattenedApps;
            return _.flatten(_apps, true);
        };

        var getAppsAndFlatten = function () {
            var _apps = Apps.apps();
            flattenedApps = setFlattenedApps(_apps);
        };

        Apps.getWebAppsDb().then(function (webAppsDb) {
            $log.log('[StoreCtrl] - initiating apps store ctrl');
            allApps = webAppsDb;
            getAppsAndFlatten();
            //loop through each app
            _.each(allApps, function (app) {
                //loop through each app tags
                _.each(app.tags, function (tag) {
                    byTags[tag] = byTags[tag] || [];
                    //push app to tag
                    byTags[tag].push(app);
                });
            });
            $scope.selectedTagApps = byTags[$scope.selectedTag];
        });

        $scope.selectTag = function (tag, e) {
            e.stopPropagation();
            $scope.selectedTag = tag;
            $scope.selectedTagApps = byTags[$scope.selectedTag];
            //report analytics
            Analytics.reportEvent(602, {
                label: tag
            });
        };

        /**
         * isInstalled
         * return whether an app has been installed
         *
         * @param app
         * @return
         */
        $scope.isInstalled = function (app) {
            return _.findWhere(flattenedApps, {
                url: app.url
            });
        };

        /**
         * install
         * Install a new app
         *
         * @param app
         * @param e
         * @return
         */
        $scope.install = function (app, e) {
            e.stopPropagation();
            Apps.addNewApp(app).then(getAppsAndFlatten);
            Analytics.reportEvent(603, {
                label: app.title || app.url
            });
        };
    }
]);
