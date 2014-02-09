/* global _ */
var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Background', ['$rootScope', '$http', 'Storage', '$q', 'FileSystem', 'Image', '$log', 'Constants',
    function($rootScope, $http, Storage, $q, FileSystem, Image, $log, C) {
        var initting = $q.defer(),
            storageKey = 'gt.background',
            background = {},
            backgrounds = [],
            localBackgroundFileName = 'myBackground';

        // intializes the service, fetch the background from localStorage or use default
        var init = function() {
            var t0 = Date.now();
            $log.log('[Background] - init service');
            Storage.get(storageKey, function(items) {
                if (items && items[storageKey]) {
                    angular.extend(background, items[storageKey]);
                    return initting.resolve(background);
                }

                setup().then(function() {
                    background = _.first(backgrounds);
                    $log.log('[Background] - finished init in ' + (Date.now() - t0) + ' ms.');
                    initting.resolve(background);
                });
            });
        };

        var getBackgroundsJson = function() {
            $log.log('[Background] - getting backgrounds json', C.BACKGROUNDS_JSON_URL);
            return $http.get(C.BACKGROUNDS_JSON_URL);
        };

        /**
         * parseBackgrounds
         * get backgrounds data from remote location
         * organize it into our format
         *
         * @param backgroundsData
         * @return
         */
        var parseBackgrounds = function(backgroundsData) {
            var _backgrounds = [];
            var paths = backgroundsData.data;
            $log.log('[Background] - got the backgrounds json', paths);
            _.each(paths, function(filesInPath) {
                _.each(filesInPath.files, function(img) {
                    _backgrounds.push({
                        image: filesInPath.path + img.image,
                        isLocalBackground: false
                    });
                });
            });

            $log.log('[Background] - found # number of backgrounds', _backgrounds.length);
            return _backgrounds;
        };

        var setBackgrounds = function(_backgrounds) {
            backgrounds = _backgrounds;
            return backgrounds;
        };

        var setup = function() {
            return getBackgroundsJson()
                .then(parseBackgrounds)
                .then(setBackgrounds);
        };

        // select and store new background selected by user
        var selectBackground = function(newBackground) {
            angular.extend(background, newBackground);
            background.timestamp = Date.now();
            store();
        };

        // store background object in the localStorage
        var store = function(cb) {
            Storage.set(storageKey, background, cb);
        };

        // handle image file uploads
        var uploadNewLocalImage = function(dataURL) {
            var uploading = $q.defer();

            Image.getBase64Image(dataURL, {
                maxWidth: 1024
            }).then(function(newDataURL) {
                saveImageToFileSystem(newDataURL, localBackgroundFileName + Date.now() + '.png').then(function(url) {
                    background.image = url;
                    background.isLocalBackground = true;
                    background.timestamp = Date.now();

                    store(function() {
                        uploading.resolve(url);
                    });
                }, function(e) {
                    uploading.reject(e);
                });
            }, function(e) {
                uploading.reject(e);
            });


            return uploading.promise;
        };

        // store image (dataURL) in the file system
        var saveImageToFileSystem = function(dataURL, fileName) {
            return FileSystem.write(fileName, dataURL);
        };

        init();

        return {
            promise: initting.promise,
            background: background,
            backgrounds: function() {
                return backgrounds;
            },
            selectBackground: selectBackground,
            uploadNewLocalImage: uploadNewLocalImage,
            store: store
        };
    }
]).directive('hlBackground', ['Background',
    function(Background) {
        return function(scope, element, attrs) {

            Background.promise.then(function(_background) {
                scope.$watch(function() {
                    return Background.background;
                }, function(newVal) {
                    if (newVal) {
                        setBackground(newVal);
                    }
                }, 1);
            });

            var setBackground = function(background) {
                var url = background.image;
                element.css({
                    backgroundImage: "url(" + background.image + ")"
                });
            };

        }
    }
]).directive('hlCropper', [

    function() {
        return function(scope, element, attrs) {
            scope.$watch(attrs.cropperOptions, function(newVal) {
                if (newVal) {
                    init(newVal);
                }
            });

            var cropperOptions,
                $editorImage = element.find('.original-image').children('img').eq(0),
                $previewImage = element.find('.preview-image').children('img').eq(0);

            var init = function(_cropperOptions) {
                cropperOptions = _cropperOptions;
                element.addClass('showed');
                $editorImage[0].src = cropperOptions.dataURL;
                $editorImage.Jcrop();
                $previewImage[0].src = cropperOptions.dataURL;
            }

            var clear = function() {
                delete cropperOptions.dataURL;
                cropperOptions = null;
            }
        }
    }
]).directive('hlBackgroundLocalImage', ['Background', '$rootScope',
    function(Background, $rootScope) {
        return function(scope, element, attrs) {
            var $preview = element.find('.preview').eq(0),
                $loader = $preview.find('.loader').eq(0),
                $previewIMG = $preview.children().eq(0),
                $file = element.find('input[type=file]').eq(0),
                $remoteUrl = element.find('input[type=text]').eq(0);

            $file.on('change', function() {
                var oFReader = new FileReader();
                oFReader.readAsDataURL($file[0].files[0]);

                oFReader.onload = function(oFREvent) {
                    $previewIMG[0].src = oFREvent.target.result;
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage(oFREvent.target.result).then(function() {
                        $loader.removeClass('showed');
                    }, function(e) {
                        $loader.removeClass('showed');
                        console.error('error:', e);
                    });
                };
            });

            $remoteUrl.on('keyup', function(e) {
                if (e.keyCode === 13 && $(this).val()) {
                    $previewIMG[0].src = $(this).val();
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage($(this).val()).then(function() {
                        $loader.removeClass('showed');
                    }, function(e) {
                        $loader.removeClass('showed');
                        console.error('error:', e);
                    });
                }
            });

            scope.$watch(function() {
                return Background.background;
            }, function(newVal) {
                if (!newVal.isLocalBackground) {
                    $preview.hide();
                }
            }, true);

            // on init, check if the current background is local image, if yes, preview it
            if (Background.background.isLocalBackground) {
                $previewIMG[0].src = Background.background.image;
                $preview.show();
            }

            scope.isSelectedLocal = function() {
                return Background.background.isLocalBackground;
            }
        };
    }
]);
