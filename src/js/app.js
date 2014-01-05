var app = angular.module('myApp', ['ui.sortable']);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['myApp']);
});

app.directive('hlLauncher', [function(){
    return function(scope, element){

        scope.curScreen = 0;

        var $viewport = element.find('.viewport').eq(0);
        var $arrowLeft = element.find('.icon-left-open-big').eq(0);
        var $arrowRight = element.find('.icon-right-open-big').eq(0);
        var screenWidth = 900;

        var getScreenWidth = function(numberOfScreen){
            return screenWidth * numberOfScreen + 'px';
        };

        var getScreenPosition = function(curScreen){
            return screenWidth * curScreen * (-1) + 'px';
        };

        var checkArrows = function(){
            if(!scope.rawScreens){
                return;
            }

            if(scope.curScreen > 0){
                $arrowLeft.show();
            }else{
                $arrowLeft.hide();
            }


            if(scope.curScreen < scope.rawScreens.length - 1){
                $arrowRight.show();
            }else{
                $arrowRight.hide();
            }
        }


        $arrowLeft.click(function(){
            scope.$apply(function(){
                if(scope.curScreen > 0){
                    --scope.curScreen;
                }else if (scope.curScreen === 0) {

                }else{

                }
            });
        });


        $arrowRight.click(function(){
            scope.$apply(function(){
                if(scope.curScreen < scope.rawScreens.length - 1){
                    ++scope.curScreen;
                }else if(scope.curScreen === scope.rawScreens.length){

                }else{

                }
            });

        });

        // watch the current screen to move the viewport
        scope.$watch('curScreen', function(newVal){
            newVal = newVal || 0;
            $viewport.css({left : getScreenPosition(newVal)});
            checkArrows();
        });

        // watch the number of screens to set the width of the viewport
        scope.$watch('rawScreens', function(newVal){
            if(newVal && newVal.length)
                $viewport.css({width : getScreenWidth(newVal.length)});
            checkArrows();
        });
    }
}]);


