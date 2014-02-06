var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Background', ['$rootScope', '$http','Storage', '$q','FileSystem','Image', function($rootScope, $http,Storage,$q, FileSystem, Image){
    var initting = $q.defer(),
        storageKey = 'gt.background',
        background = {},
        backgrounds = [
            {image : './img/wallpapers/bg.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg1.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg6.jpg', isLocalBackground : false},
            {image : './img/wallpapers/lake_unsplash.jpg', isLocalBackground : false},
            {image : './img/wallpapers/Elegant_Background-4.jpg', isLocalBackground : false},
            {image : './img/wallpapers/Elegant_Background-5.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0010.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0015.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0017.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0023.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0034.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0035.jpg', isLocalBackground : false},
            {image : './img/wallpapers/abstract_0036.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg100.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg102.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg103.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg104.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg105.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg106.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg107.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg108.jpg', isLocalBackground : false},
            {image : './img/wallpapers/bg109.jpg', isLocalBackground : false},

        ],
        defaultBackground = backgrounds[0],
        localBackgroundFileName = 'myBackground';

    // intializes the service, fetch the background from localStorage or use default
    var init = function(){
        Storage.get(storageKey, function(items){
            if(items && items[storageKey]){
                angular.extend(background, items[storageKey]);
                initting.resolve(background);
            }else{
                angular.extend(background, defaultBackground);
                initting.resolve(background);
            }
        });
    };


    // select and store new background selected by user
    var selectBackground = function(newBackground){
        angular.extend(background, newBackground);
        background.timestamp = Date.now();
        store();
    };

    // store background object in the localStorage
    var store = function(cb){
        Storage.set(storageKey, background, cb);
    };

    // handle image file uploads
    var uploadNewLocalImage = function(dataURL){
        var uploading = $q.defer();

        Image.getBase64Image(dataURL, {maxWidth:1024}).then(function(newDataURL){
            saveImageToFileSystem(newDataURL,localBackgroundFileName+Date.now()+".png").then(function(url){
                background.image = url;
                background.isLocalBackground = true;
                background.timestamp = Date.now();

                store(function(){
                    uploading.resolve(url);
                });
            }, function(e){
                uploading.reject(e);
            });
        }, function(e){
            uploading.reject(e);
        });


        return uploading.promise;
    };

    // store image (dataURL) in the file system
    var saveImageToFileSystem = function(dataURL,fileName){
        return FileSystem.write(fileName, dataURL);
    };


    init();

    return {
        promise : initting.promise,
        background : background,
        backgrounds : function(){
            return backgrounds;
        },
        selectBackground : selectBackground,
        uploadNewLocalImage : uploadNewLocalImage,
        store : store
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
                //var url = background.image.indexOf('chrome') === -1 ? chrome.extension.getURL(background.image) : background.image;
                var url = background.image;
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
    }]).directive('hlBackgroundLocalImage', ['Background','$rootScope', function(Background,$rootScope){
        return function (scope, element, attrs){
            var $preview = element.find('.preview').eq(0),
                $loader = $preview.find('.loader').eq(0),
                $previewIMG = $preview.children().eq(0),
                $file = element.find('input[type=file]').eq(0),
                $remoteUrl = element.find('input[type=text]').eq(0);

            $file.on('change', function(){
                var oFReader = new FileReader();
                oFReader.readAsDataURL($file[0].files[0]);

                oFReader.onload = function (oFREvent) {
//              $rootScope.$apply(function(){
//                  scope.cropperOptions = {
//                      dataURL : oFREvent.target.result
//                  };
//              });
                    $previewIMG[0].src = oFREvent.target.result;
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage(oFREvent.target.result).then(function(){
                        $loader.removeClass('showed');
                    }, function(e){
                        $loader.removeClass('showed');
                        console.error('error:',e);
                    });
                };
            });

            $remoteUrl.on('keyup', function(e){
                if(e.keyCode === 13 && $(this).val()){
                    $previewIMG[0].src = $(this).val();
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage($(this).val()).then(function(){
                        $loader.removeClass('showed');
                    }, function(e){
                        $loader.removeClass('showed');
                        console.error('error:',e);
                    });
                }
            });

            scope.$watch(function(){
                return Background.background;
            }, function(newVal){
                if (!newVal.isLocalBackground){
                    $preview.hide();
                }
            }, true);

            // on init, check if the current background is local image, if yes, preview it
            if(Background.background.isLocalBackground){
                $previewIMG[0].src = Background.background.image;
                $preview.show();
            }

            scope.isSelectedLocal = function(){
                return Background.background.isLocalBackground;
            }
        };
    }]);
