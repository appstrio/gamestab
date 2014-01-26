app.directive('hlLauncher', ['Apps', function(Apps){
        return function(scope, element){

            scope.curScreen = 0;

            var $viewport = element.find('.viewport').eq(0);
            var $arrowLeft = element.find('.icon-left-open-big').eq(0);
            var $arrowRight = element.find('.icon-right-open-big').eq(0);
            var screenWidth = 880;
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
                    if(scope.curScreen > 0){
                        --scope.curScreen;
                        moveViewport();
                        $draggingHelper.animate({left : "-=" + screenWidth + "px"}, 1300);
                    }
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
                    if(scope.curScreen < scope.rawScreens.length - 1){
                        ++scope.curScreen;
                        $draggingHelper.animate({left : "+=" + screenWidth + "px"}, 1300);
                        moveViewport();
                    }
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
                //tolerance : 'pointer',
                disabled: true,
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
                    angular.forEach(scope.rawScreens, function(screen, index){

                        if(screen.length > 12){
                            var lastApp = screen.pop();
                            moveLastAppToNewScreen(lastApp, index);
                        }
                    });
                },
                connectWith: ".apps-container"

            };

            var moveLastAppToNewScreen = function(app, startIndex){
                var foundNewScreen = false, screen;
                for (var i = startIndex; i<scope.rawScreens.length; ++i){
                    screen = scope.rawScreens[i];
                    if(screen.length < 12){
                        screen.push(app);
                        Apps.store();
                        foundNewScreen = true;
                        break;
                    }
                }

                if(!foundNewScreen){
                    var newScreen = [app];
                    scope.rawScreens.push(newScreen);
                    Apps.store();
                }

            }

            scope.longPress = function(app, e){
                scope.isEditing = true;
                scope.sortableOptions.disabled = false;
            }

            $(document).click(function(){
                scope.$apply(function(){
                    scope.isEditing = false;
                    scope.sortableOptions.disabled = true;
                });
            });
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
    }]).directive('hlBackgroundLocalImage', ['Background','$rootScope', function(Background,$rootScope){
        return function (scope, element, attrs){
            var $preview = element.parent().siblings('.preview').eq(0),
                $previewIMG = $preview.children().eq(0);
            element.on('change', function(){
                var oFReader = new FileReader();
                oFReader.readAsDataURL(element[0].files[0]);

                oFReader.onload = function (oFREvent) {
//              $rootScope.$apply(function(){
//                  scope.cropperOptions = {
//                      dataURL : oFREvent.target.result
//                  };
//              });
                    $previewIMG[0].src = oFREvent.target.result;
                    $preview.show();
                    Background.uploadNewLocalImage(oFREvent.target.result);
                };
            });

            // on init, check if the current background is local image, if yes, preview it
            if(Background.background.isLocalBackground){
                $previewIMG[0].src = Background.background.image;
                $preview.show();
            }
        };
    }]).directive('hlBackground', ['Background', function(Background){
        return function(scope, element, attrs){
//            var $iframe = $('iframe.blurred-background'),
//                bodyCss = {
//                    margin : "0",
//                    padding : "0"
//                },
//                divCss = {
//                    position:"fixed",
//                    top:"-20%",
//                    left:"-20%",
//                    width:"150%",
//                    height:"150%",
//                    backgroundPosition: "center calc(50% - 101px)",
//                    backgroundRepeat : "no-repeat",
//                    backgroundSize: "cover",
//                    "webkitFilter": "blur(17px) contrast(0.8) brightness(1.2)",
//                },
//
//                docHeight = $(document).height();
//
//            var $div = $iframe.contents().find('body').css(bodyCss).append('<div></div>').children().eq(0).css(divCss);

            Background.promise.then(function(_background){
                scope.$watch(function(){
                    return Background.background;
                }, function(newVal){
                    if(newVal){
                        setBackground(newVal);
                    }
                }, 1);
            });

            var setBackground = function(background){
                var url = background.image.indexOf('chrome') === -1 ? chrome.extension.getURL(background.image) : background.image;
                element.css({backgroundImage : "url(" + background.image + ")"});
//            $div.css({backgroundImage : "url('" + url + "')"});
            };

        }
    }]).directive('hlCropper', [function(){
        return function(scope, element, attrs){
            scope.$watch(attrs.cropperOptions, function(newVal){
                if(newVal){
                    init(newVal);
                }
            });

            var cropperOptions,
                $editorImage = element.find('.original-image').children('img').eq(0),
                $previewImage = element.find('.preview-image').children('img').eq(0);

            var init = function(_cropperOptions){
                cropperOptions = _cropperOptions;
                element.addClass('showed');
                $editorImage[0].src = cropperOptions.dataURL;
                $editorImage.Jcrop();
                $previewImage[0].src = cropperOptions.dataURL;
            }

            var clear = function(){
                delete cropperOptions.dataURL;
                cropperOptions = null;
            }
        }
    }]).directive('hlLongPress',['$parse', function($parse) {
        return function(scope, element, attr) {
            var fn = $parse(attr['hlLongPress']);
            element.longPress(function(event){
                scope.$apply(function() {
                    fn(scope, {$event:event});
                });
            }, 200);
        };
    }]);



(function($) {
    $.fn.longPress = function(callback, timeout) {
        var timer, isLongPress = false;
        timeout = timeout || 500;
        $(this).mousedown(function(e) {
            isLongPress = false;
            timer = setTimeout(function() {callback(e); isLongPress = true;}, timeout);
        }).click(function(e){
                if(isLongPress){
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        $(document).mouseup(function(e) {
            if(isLongPress){
                e.stopPropagation();
                e.preventDefault();
            }
            clearTimeout(timer);
        });
    };

})(jQuery);
