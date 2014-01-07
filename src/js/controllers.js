app.controller('MainCtrl', ['$scope', '$http', 'Apps', function($scope, $http, Apps){
    Apps.promise.then(function(apps){
        $scope.rawScreens = apps;
    }, function(){
        alert('Cannot run without apps :(');
    });
}]);