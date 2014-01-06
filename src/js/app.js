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
        scope.isDragging = false;

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
            if(scope.curScreen > 0){
                --scope.curScreen;
                moveViewport();
            }else if (scope.curScreen === 0) {

            }else{

            }
        }).mouseover(function(){
                if(!scope.isDragging) return;
                $(this).trigger('click');
        });


        $arrowRight.click(function(){
            if(scope.curScreen < scope.rawScreens.length - 1){
                ++scope.curScreen;
                moveViewport();
            }else if(scope.curScreen === scope.rawScreens.length){

            }else{

            }

        }).mouseover(function(){
                if(!scope.isDragging) return;
                $(this).trigger('click');
                //$draggingHelper.animate({left : "=+" + screenWidth + "px"}, 1000);
        });


        var moveViewport = function(){
            var newVal = scope.curScreen || 0;
            $viewport.css({left : getScreenPosition(newVal)});
            checkArrows();
        }

        // watch the number of screens to set the width of the viewport
        scope.$watch('rawScreens', function(newVal){
            if(newVal && newVal.length)
                $viewport.css({width : getScreenWidth(newVal.length)});
            checkArrows();
        });

        var $draggingItem, $draggingHelper, $draggingPlaceholder;
        scope.sortableOptions = {
           // tolerance : 'pointer',
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

                scope.isDragging = true;
            },
            stop: function (e, u) {
                // remove unnecessary classes
                $draggingHelper.removeClass("dragging");
                $draggingHelper.parent().parent().removeClass('edit');
                // clean variables
                scope.isDragging = false;
                $draggingHelper = null;
                $draggingItem = null;
                $draggingPlaceholder = null;
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
    }
}]);


