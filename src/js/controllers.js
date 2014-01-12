app.controller('MainCtrl', ['$scope', '$http', 'Apps', function($scope, $http, Apps){

    Apps.promise.then(function(apps){
        console.log('controller',apps);
        $scope.rawScreens = apps;
    }, function(){
        alert('Cannot run without apps :(');
    });

    $scope.launchApp = function(app, e){
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
            console.log('app.overlay',app.overlay,'$scope.overlay',$scope.overlay);
            $scope.overlay = {name : app.overlay};
        }
    }

}]).controller('SettingsCtrl', ['$scope', function($scope){
    $scope.panes = ["General", "Background", "Notifications", "Restore", "About"];
    $scope.selectedPane = "General";

    $scope.selectPane = function(pane, e){
        console.log('pane',pane);
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

}]);

var h = function Do(){
    $('#overlay').addClass('showed');
    $('#wrapper').addClass('blurred');
    setTimeout(function(){
        $('#overlay').addClass('enlarged');
    },0);

}