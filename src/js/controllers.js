app.controller('MainCtrl', ['$scope', '$http', 'Apps', function($scope, $http, Apps){

    Apps.promise.then(function(apps){
        $scope.rawScreens = apps;
    }, function(){
        alert('Cannot run without apps :(');
    });

    $scope.launchApp = function(app, e){
        if($scope.isEditing){
            return false;
        }
        if(app.url){
            return window.location = app.url;
        }else if(app.chromeId){
            chrome.management.launchApp(app.chromeId, function (){

            });
//            chrome.management.get(, function(chromeApp){
//                console.log('chromeApp',chromeApp);
//                chromeApp.launch();
//            });
        }else if(app.overlay){
            $scope.overlay = {name : app.overlay};
        }
    }

    $scope.uninstallApp = function(app, e){
        Apps.uninstallApp(app);
    }

}]).controller('SettingsCtrl', ['$scope', function($scope){
    $scope.panes = ["General", "Background", "Notifications", "Restore", "About"];
    $scope.selectedPane = "General";

    $scope.selectPane = function(pane, e){
        e.stopPropagation();
        $scope.selectedPane = pane;
    };

}]).controller('BackgroundCtrl', ['$scope','Background', function($scope, Background){
        $scope.backgrounds = Background.backgrounds();

        $scope.selectBackground = function(bg, e){
            e.stopPropagation();
            Background.selectBackground(bg);
        };

        $scope.isSelected = function(bg){
            return bg.image == Background.background.image;
        };

}]).controller('StoreCtrl', ['$scope', 'Apps', function($scope, Apps){
        var db, byTags={}, flattenedApps, allInstalledApps;
        Apps.appsDB().success(function(appsDB){
            db = appsDB;
            var current;
            for(var i = 0; i < $scope.tags.length; ++i){
                current = $scope.tags[i];
                byTags[current] = _.filter(db, function(app){
                    return (app.tags && app.tags.indexOf(current) > -1);
                });
            }
            $scope.selectedTagApps = byTags[$scope.selectedTag];
        });

        Apps.promise.then(function(_installedApps){
            allInstalledApps = _installedApps;
            setFlattenedApps();
        });

        var setFlattenedApps = function(){
            flattenedApps = _.flatten(allInstalledApps, true);
        }

        $scope.tags = ['Featured', 'Games', 'Social'];
        $scope.selectedTag = 'Featured';

        $scope.selectTag = function(tag, e){
            e.stopPropagation();
            $scope.selectedTag = tag;
            $scope.selectedTagApps = byTags[$scope.selectedTag];
        };

        $scope.isInstalled = function(app){
            return _.find(flattenedApps, function(_app){
                return _app && _app.url && _app.url == app.url;
            });
        };



        $scope.install = function(app, e){
            e.stopPropagation();
            Apps.addNewApp(app);
            setFlattenedApps();
        }

    }]);