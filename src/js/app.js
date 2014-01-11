var app = angular.module('myApp', ['ui.sortable']);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['myApp']);
});

app.directive('hlLauncher', ['Apps', function(Apps){
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
                scope.$apply(function(){
                    Apps.store();
                });
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
}]).directive('hlOverlay',[function(){
    return {
        scope : {
            overlayOptions : "="
        },
        link : function(scope, element, attrs){

            var $overlay = element;

            scope.$watch('overlayOptions', function(newVal){
                if(!newVal || !newVal.name){
                    hide();
                }else{
                    scope.templateURL = newVal.name + '.html';
                    setTimeout(show, 0);
                }
            });


            var hide = function(done){
                $overlay.removeClass('showed');
                $('#wrapper').removeClass('blurred');
                $overlay.removeClass('enlarged');
                setTimeout(function(){
                    scope.templateURL = '';
                    scope.overlayOptions = null;
                    done && done();
                },0);
            };
            var show = function(done){
                $overlay.addClass('showed');
                $('#wrapper').addClass('blurred');
                setTimeout(function(){
                    $overlay.addClass('enlarged');
                    setTimeout(function(){
                        done && done();
                    },0);
                },0);
            };

            element.on('click', function(e){
               hide();
            }).on('click','.main', function(e){
                e.stopPropagation();
            });

            scope.$on('$destroy', function(){
                element.off();
            })
        }
    }
}]).directive('hlBackgroundLocalImage', [function(){
    return function (scope, element, attrs){
      var $preview = element.parent().siblings('.preview').eq(0),
          $previewIMG = $preview.children().eq(0);
      element.on('change', function(){
          var oFReader = new FileReader();
          oFReader.readAsDataURL(element[0].files[0]);

          oFReader.onload = function (oFREvent) {
              $previewIMG[0].src = oFREvent.target.result;
              $preview.show();
          };
      });
    };
}]).directive('hlBackground', ['Background', function(Background){
    return function(scope, element, attrs){
        Background.promise.then(function(_background){
            scope.$watch(function(){
                return Background.background;
            }, function(newVal){
                console.log('BG newVal',newVal);
                if(newVal){
                    setBackground(newVal);
                }
            }, 1);
        });

        var setBackground = function(background){
            element.css({backgroundImage : "url(" + background.image + ")"});
        };

    }
}]);


