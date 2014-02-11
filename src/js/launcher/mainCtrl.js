/* global _ */
var launcherModule = launcherModule || angular.module('aio.launcher', []);

launcherModule.controller('MainCtrl', ['$scope', '$http', 'Apps', 'Config',
    function ($scope, $http, Apps, Config) {

        $scope.displayTopSearchBox = 1;
        Apps.promise.then(function (apps) {
            $scope.rawScreens = apps;
            $scope.config = Config.get();
        }, function () {
            alert('Cannot run without apps :(');
        });

        $scope.launchApp = function (app, e) {
            if ($scope.isEditing) {
                return false;
            }
            if (app.url) {
                window.location = app.url;
                return;
            } else if (app.chromeId) {
                chrome.management.launchApp(app.chromeId, function () {});
            } else if (app.overlay) {
                $scope.overlay = {
                    name: app.overlay
                };
            }
        };

        $scope.uninstallApp = function (app, e) {
            Apps.uninstallApp(app);
        };

        $scope.goSearch = function (e) {
            if (e.keyCode === 13) {
                window.location = 'http://www.google.com/search?q=' + $scope.searchQuery;
            }
        };

        $('#search-input').keypress($scope.goSearch); //TODO:
    }
]).controller('SettingsCtrl', ['$scope',
    function ($scope) {
        $scope.panes = ['General', 'Background', 'Account', 'About'];
        $scope.selectedPane = 'General';
        $scope.clientVersion = chrome.app.getDetails().version;
        $scope.selectPane = function (pane, e) {
            e.stopPropagation();
            $scope.selectedPane = pane;
        };

    }
]).controller('BackgroundCtrl', ['$scope', 'Background',
    function ($scope, Background) {
        $scope.backgrounds = Background.backgrounds();

        $scope.selectBackground = function (bg, e) {
            e.stopPropagation();
            Background.selectBackground(bg);
        };

        $scope.isSelected = function (bg) {
            return bg.isActive;
        };

    }
]).controller('StoreCtrl', ['$scope', 'Apps',
    function ($scope, Apps) {
        var byTags = {}, flattenedApps, allInstalledApps;

        $scope.tags = ['Featured', 'Games', 'Social', 'News & Weather', 'Shopping', 'Productivity'];
        //default starting tag
        $scope.selectedTag = 'Featured';

        Apps.appsDB().success(function (appsDb) {
            //loop through each app
            _.each(appsDb, function (app) {
                //loop through each app tags
                _.each(app.tags, function (tag) {
                    byTags[tag] = byTags[tag] || [];
                    //push app to tag
                    byTags[tag].push(app);
                });
            });
            $scope.selectedTagApps = byTags[$scope.selectedTag];
        });

        Apps.promise.then(function (_installedApps) {
            allInstalledApps = _installedApps;
            setFlattenedApps();
        });

        var setFlattenedApps = function () {
            flattenedApps = _.flatten(allInstalledApps, true);
        };


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
            setFlattenedApps();
        };
    }
]);
