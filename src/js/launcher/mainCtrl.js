/* global _ */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.controller('MainCtrl', ['$scope', '$http', 'Apps', 'Config', '$log', 'Background', 'Analytics',
    function ($scope, $http, Apps, Config, $log, Background, Analytics) {

        //get from settings
        $scope.displayTopSearchBox = 1;

        var assignScopeVars = function () {
            $log.log('[MainCtrl] - Apps finished loading. Organizing dials');
            $scope.rawScreens = Apps.apps();
            $scope.config = Config.get();
        };

        console.debug('[MainCtrl] - init');
        //load config from local or remote
        Config.init()
        //load apps from local or remote
        .then(Apps.init)
        //load analytics scripts
        .then(Analytics.init)
        //assign main ctrl scope vars
        .then(assignScopeVars)
        //load background from local or remote
        .then(Background.init);

        $scope.launchApp = function (app, e) {
            //user is editing dials. don't launch
            if ($scope.isEditing) {
                return false;
            }

            //app is a link. run it
            if (app.url) {
                window.location = app.url;
                return;
            }

            //app is a chrome app. launch it
            if (app.chromeId) {
                chrome.management.launchApp(app.chromeId, function () {});
            }

            //app is an overlay. run it
            if (app.overlay) {
                $scope.overlay = {
                    name: app.overlay
                };
            }
        };

        /**
         * uninstallApp
         * User clicked to uninstall app
         *
         * @param app
         * @param e
         * @return
         */
        $scope.uninstallApp = function (app, e) {
            Apps.uninstallApp(app);
        };

        /**
         * goSearch
         * activated every time a user presses a key in the search
         *
         * @param e
         * @return
         */
        $scope.goSearch = function (e) {
            if (e.keyCode === 13) {
                window.location = 'http://www.google.com/search?q=' + $scope.searchQuery;
            }
        };

        $('#search-input').keypress($scope.goSearch); //TODO:
    }
]).controller('SettingsCtrl', ['$scope', 'Constants',
    function ($scope, C) {
        $scope.panes = ['General', 'Background', 'About'];
        //initial selected pane
        $scope.selectedPane = 'General';
        //get version for display
        $scope.clientVersion = C.APP_VERSION;

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
        };
    }
]).controller('BackgroundCtrl', ['$scope', 'Background',
    function ($scope, Background) {

        Background.isReady.then(function () {
            $scope.backgrounds = Background.backgrounds();
        });

        $scope.selectBackground = function (bg, e) {
            e.stopPropagation();
            Background.selectBackground(bg);
        };

        $scope.isSelected = function (bg) {
            return bg.isActive;
        };

    }
]).controller('StoreCtrl', ['$scope', 'Apps', '$log',
    function ($scope, Apps, $log) {
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
            Apps.addNewApp(app);
            getAppsAndFlatten();
        };
    }
]);
