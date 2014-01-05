app.controller('MainCtrl', ['$scope', '$http', function($scope, $http){
    var $draggingHelper;

    $scope.sortableOptions = {
        tolerance : 'pointer',
        disabled: false,
        start: function (e, u) {
            $draggingItem = $(u.item);
            $draggingHelper = $(u.helper)
            $draggingPlaceholder = $(u.placeholder);
            $draggingItem.appendTo($draggingItem.parent());
            $draggingHelper.addClass("dragging");
            setTimeout(function(){
                $draggingHelper.parent().parent().addClass('edit');
            },0);

            $scope.isDragging = true;
        },
        stop: function (e, u) {
            // remove unnecessary classes
            $draggingHelper.removeClass("dragging");
            $draggingHelper.parent().parent().removeClass('edit');
            // clean variables
            $scope.isDragging = false;
            $draggingHelper = null;
            $draggingItem = null;
            $draggingPlaceholder = null;
            // move extra items to next screen
            var currentScreen, movingItem, i, j, newScreen;
            setTimeout(function(){
                $scope.$apply(function(){
                    for(i = 0; i<$scope.rawScreens.length; ++i){
                        currentScreen = $scope.rawScreens[i];
                        if(currentScreen.length > $scope.maxAppsPerScreen){
                            movingItem = currentScreen.pop();

                            if(i >= $scope.rawScreens.length - 1){
                                // this is last screen - create new screen
                                $scope.rawScreens.push([ movingItem ]);
                            }else{
                                j = i + 1;
                                newScreen = $scope.rawScreens[j];
                                newScreen.push(movingItem);
                            }
                        }
                    }

                });
            },1);
        },
        placeholder: "app",
        revert: 500,
        opacity: .75,
        helper: "clone",
        over: function (e, u) {
        },
        sort: function (e, u) {
        },
        receive: function (e, u) {
        },
        connectWith: ".apps-container"

    };

    $http.get('./data/defaultDials.json').success(function(responseDials){
        console.log('responseDials',responseDials);
        $scope.rawScreens = [responseDials];
    });

//    $scope.rawScreens = [
//        [
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'},
//            {icon : './img/icons/facebook.jpg', title: 'Facebook', link : 'http://www.facebook.com'}
//        ],
//        [
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'},
//            {icon : './img/icons/youtube.jpg', title: 'Youtube', link : 'http://www.youtube.com'}
//        ],
//        [
//            {icon : './img/icons/twitter.jpg', title: 'Twitter', link : 'http://www.twitter.com'},
//            {icon : './img/icons/twitter.jpg', title: 'Twitter', link : 'http://www.twitter.com'},
//            {icon : './img/icons/twitter.jpg', title: 'Twitter', link : 'http://www.twitter.com'},
//            {icon : './img/icons/twitter.jpg', title: 'Twitter', link : 'http://www.twitter.com'},
//            {icon : './img/icons/twitter.jpg', title: 'Twitter', link : 'http://www.twitter.com'}
//        ]
//    ];

}]);