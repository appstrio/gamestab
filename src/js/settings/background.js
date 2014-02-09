/* global _ */
var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Background', ['$rootScope', '$http', 'Storage', '$q', 'FileSystem', 'Image', '$log', 'Constants',
    function($rootScope, $http, Storage, $q, FileSystem, Image, $log, C) {
        var initting = $q.defer(),
            storageKey = C.STORAGE_KEYS.BACKGROUNDS,
            background = {},
            backgrounds = [];

        // intializes the service, fetch the background from localStorage or use default
        var init = function() {
            var t0 = Date.now();
            $log.log('[Background] - init service. Getting from localStorage');
            Storage.get(storageKey, function(items) {
                var _backgrounds = items && items[storageKey];
                if (_backgrounds && angular.isArray(_backgrounds)) {
                    $log.log('[Background] - Found backgrounds in localStorage', _backgrounds.length);
                    getActiveBackground(_backgrounds);
                    backgrounds = _backgrounds;
                    $log.log('[Background] - finished init in ' + (Date.now() - t0) + ' ms.');
                    return initting.resolve(background);
                }

                $log.log('[Background] - did not find backgrounds in localStorage. Getting from remote');

                //set default background to local one.
                setDefaultBackground();

                //local backgrounds not found.
                getBackgroundsJson()
                    .then(parseBackgrounds)
                    .then(Image.convertFieldToLocalFile.bind(null, 'image'))
                    .then(function() {
                        store(function() {
                            $log.log('[Background] - finished init in ' + (Date.now() - t0) + ' ms.');
                            $rootScope.$apply(function() {
                                initting.resolve(background);
                            });
                        });
                    });
            });
        };

        /**
         * setDefaultBackground
         * Sets the default backgorund image to a local one, defined in constants
         *
         * @return
         */
        var setDefaultBackground = function() {
            var newBackground = {
                image: C.DEFAULT_BACKGROUND_IMG,
                isLocalBackground: false,
                isActive: true
            };

            backgrounds.push(newBackground);
            broadcastNewBackground(newBackground);
        };

        /**
         * getActiveBackground
         * gets the active background from the list, or returns the first 1 as default
         *
         * @param _backgrounds
         * @return
         */
        var getActiveBackground = function(_backgrounds) {
            var _background;

            //error validation
            if (!_backgrounds || !_backgrounds.length) {
                return;
            }

            _background = _.findWhere(_backgrounds, {
                isActive: true
            });

            if (!_background) {
                _background = _backgrounds[0];
                _background.isActive = true;
            }

            broadcastNewBackground(_background);
            return _background;
        };

        /**
         * broadcastNewBackground
         * Broadcast that background has changed
         *
         * @param _background
         * @return
         */
        var broadcastNewBackground = function(_background) {
            background = _background;
            $rootScope.$broadcast('setBackgroundImage', _background);
        };

        /**
         * getBackgroundsJson
         * do a http.GET request to backgrounds json
         *
         * @return
         */
        var getBackgroundsJson = function() {
            $log.log('[Background] - getting backgrounds json', C.BACKGROUNDS_JSON_URL);
            return $http.get(C.BACKGROUNDS_JSON_URL);
        };

        /**
         * turnOffActiveBackgrounds
         * returns an array of all items that have isActive:true
         *
         * @return
         */
        var turnOffActiveBackgrounds = function() {
            _.chain(backgrounds)
                .where({
                    isActive: true
                })
                .each(function(item) {
                    item.isActive = false;
                })
                .value();
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
            var paths = backgroundsData.data;
            $log.log('[Background] - got the backgrounds json', paths);
            _.each(paths, function(filesInPath) {
                _.each(filesInPath.files, function(img) {
                    backgrounds.push({
                        image: filesInPath.path + img.image,
                        isLocalBackground: false,
                        isActive: false
                    });
                });
            });

            $log.log('[Background] - found # number of backgrounds', backgrounds.length);
            return backgrounds;
        };

        // select and store new background selected by user
        var selectBackground = function(newBackground) {
            $log.log('[Background] - changing to new background', newBackground.image);
            //turn off all active
            turnOffActiveBackgrounds();

            newBackground.isActive = true;
            newBackground.timestamp = Date.now();

            broadcastNewBackground(newBackground);
            store();
        };

        // store background object in the localStorage
        var store = function(cb) {
            //enforce function type
            cb = cb || angular.noop;
            Storage.setItem(storageKey, backgrounds, cb);
        };

        // handle image file uploads
        var uploadNewLocalImage = function(dataURL) {
            var uploading = $q.defer();

            Image.urlToLocalFile({
                url: dataURL,
                resizeOptions: {
                    maxWidth: 1024
                }
            }).then(function(file) {

                turnOffActiveBackgrounds();

                var newBackground = {
                    image: file,
                    isLocalBackground: true,
                    timestamp: Date.now(),
                    isActive: true
                };

                backgrounds.push(newBackground);
                broadcastNewBackground(newBackground);

                store(function() {
                    $rootScope.$apply(function() {
                        uploading.resolve(file);
                    });
                });
            }, function(e) {
                $rootScope.$apply(function() {
                    uploading.reject(e);
                });
            });

            return uploading.promise;
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
]).directive('hlBackground', ['Background', '$log',
    function(Background, $log) {
        return function(scope, element, attrs) {
            var setBackground = function(background) {
                element.css({
                    backgroundImage: 'url(' + background + ')'
                });
            };

            scope.$on('setBackgroundImage', function(e, image) {
                $log.log('[hlBackground] - set background image', image.image);
                setBackground(image.image);
            });
        };
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
            };

            var clear = function() {
                delete cropperOptions.dataURL;
                cropperOptions = null;
            };
        };
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
                        console.log('finished uploading');
                        $loader.removeClass('showed');
                        $preview.hide();
                    }, function(e) {
                        $loader.removeClass('showed');
                        $preview.hide();
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
                        $preview.hide();
                    }, function(e) {
                        $loader.removeClass('showed');
                        $preview.hide();
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

            scope.isSelectedLocal = function() {
                return Background.background.isLocalBackground;
            };

            // on init, check if the current background is local image, if yes, preview it
            if (scope.isSelectedLocal()) {
                $previewIMG[0].src = Background.background.image;
                $preview.show();
            }
        };
    }
]);
