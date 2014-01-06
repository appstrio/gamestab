app.controller('MainCtrl', ['$scope', '$http', function($scope, $http){
    $http.get('./data/defaultDials.json').success(function(responseApps){
        $http.get('./data/games.json').success(function(responseGames){
            $scope.rawScreens = [responseApps,responseGames.slice(0,15)];
        });
    });
}]);