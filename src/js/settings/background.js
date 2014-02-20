/* global _ */
angular.module('aio.settings').factory('Background', [
    '$rootScope', 'Storage', '$q', 'Image', '$log', 'Constants', 'Chrome', 'Helpers',
    function ($rootScope, Storage, $q, Image, $log, C, Chrome, Helpers) {
        var isReady = $q.defer(),
            storageKey = C.STORAGE_KEYS.BACKGROUNDS,
            background = {},
            isCacheNeededFlag = false,
            backgrounds = [];

        var loadFromStorage = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var setup = function () {
            //local backgrounds not found.
            return Helpers.loadRemoteJson(C.BACKGROUNDS_JSON_URL)
                .then(parseBackgrounds)
                .then(store)
                .then(reportDone.bind(null, 'stored backgrounds'))
                .then(isReady.resolve.bind(null, background));
        };

        // intializes the service, fetch the background from localStorage or use default
        var init = function () {
            console.debug('[Background] - init');

            function onSuccess(_data) {
                $log.info('[Background] - Done with loading from storage', _data.length);
                getActiveBackground(_data);
                backgrounds = _data;
                return isReady.resolve(background);
            }

            function onError() {
                $log.log('[Background] - did not find local settings.');
                //set default background to local one.
                setDefaultBackground();
                //need to cache images
                isCacheNeededFlag = true;
                return false;
            }

            return loadFromStorage().then(onSuccess, onError);
        };

        var lazyCacheImages = function () {
            console.debug('[Background] - starting to lazy cache items');
            return Image.convertFieldToLocalFile('image', {}, backgrounds)
                .then(Image.generateThumbnail.bind(null, 'image', {
                resizeOptions: {
                    fixedHeight: 160,
                    fixedWidth: 160
                }
                }))
                .then(store)
                .then(reportDone.bind(null, 'lazy cache images'))
                .then(function () {
                    isCacheNeededFlag = false;
                });
        };

        var reportDone = function (activity) {
            $log.info('[Background] - done with: ' + activity);
        };

        /**
         * isCacheNeeded
         * returns true if any backgrounds.image is a remote url
         *
         * @return
         */
        var isCacheNeeded = function () {
            var arr = backgrounds;

            return _.some(arr, function (item) {
                return Image.helpers.isPathRemote(item.image);
            });
        };

        /**
         * setDefaultBackground
         * Sets the default backgorund image to a local one, defined in constants
         *
         * @return
         */
        var setDefaultBackground = function () {
            var newBackground = {
                image: Chrome.extension.getURL(C.DEFAULT_BACKGROUND_IMG),
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
        var getActiveBackground = function (_backgrounds) {
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
        var broadcastNewBackground = function (_background) {
            background = _background;
            $rootScope.$broadcast('setBackgroundImage', _background);
        };

        /**
         * turnOffActiveBackgrounds
         * returns an array of all items that have isActive:true
         *
         * @return
         */
        var turnOffActiveBackgrounds = function () {
            _.chain(backgrounds)
            //find active backgrounds
            .where({
                isActive: true
            })
            //turn each one to isActive=false
            .each(function (item) {
                item.isActive = false;
            })
            //run
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
        var parseBackgrounds = function (backgroundsData) {
            var paths = backgroundsData.data;
            $log.log('[Background] - got the backgrounds json', paths);
            _.each(paths, function (filesInPath) {
                _.each(filesInPath.files, function (img) {
                    backgrounds.push({
                        image: filesInPath.path + img.image,
                        thumbnail: filesInPath.path + filesInPath.thumbnail_path + img.image,
                        isLocalBackground: false,
                        isActive: false
                    });
                });
            });

            $log.log('[Background] - found # number of backgrounds', backgrounds.length);
            return backgrounds;
        };

        // select and store new background selected by user
        var selectBackground = function (newBackground) {
            $log.log('[Background] - changing to new background', newBackground.image);
            //turn off all active
            turnOffActiveBackgrounds();

            newBackground.isActive = true;
            newBackground.timestamp = Date.now();

            broadcastNewBackground(newBackground);
            store();
        };

        // store background object in the localStorage
        var store = function () {
            return Helpers.store(storageKey, backgrounds);
        };

        // handle image file uploads
        var uploadNewLocalImage = function (dataURL) {
            var uploading = $q.defer();

            Image.urlToLocalFile({
                url: dataURL,
                resizeOptions: {
                    maxWidth: 1024
                }
            }).then(function (file) {

                turnOffActiveBackgrounds();

                var newBackground = {
                    image: file,
                    isLocalBackground: true,
                    timestamp: Date.now(),
                    isActive: true
                };

                backgrounds.push(newBackground);
                broadcastNewBackground(newBackground);
                store().then(function () {
                    uploading.resolve(file);
                });
            }, function (e) {
                $rootScope.$apply(function () {
                    uploading.reject(e);
                });
            });

            return uploading.promise;
        };

        return {
            isReady: isReady.promise,
            background: background,
            init: init,
            setup: setup,
            backgrounds: function () {
                return backgrounds;
            },
            isCacheNeeded: function () {
                //return true if flag is up, or if any items pass the remote url check
                return isCacheNeededFlag || isCacheNeeded();
            },
            lazyCacheImages: lazyCacheImages,
            selectBackground: selectBackground,
            uploadNewLocalImage: uploadNewLocalImage,
            store: store
        };
    }
]).directive('hlBackground', function () {
    return function (scope, element) {

        // search blurred background setup
        var iframeHTML = '<link href=\'css/bg-iframe.css\' rel=\'stylesheet\') /><div class=\'bg\'></div>',
            $iframe = $('iframe.blurred-background').eq(0),
            $iframeContents = $iframe.contents(),
            $iframeBody = $iframeContents.find('body'),
            $iframeDiv,
            iframeShown = false;

        $iframeBody.append(iframeHTML);
        $iframeDiv = $iframeBody.find('div.bg').eq(0);

        var setBackground = function (e, image) {
            var background = image.image;
            element.css({
                backgroundImage: 'url(' + background + ')'
            });

            $iframeDiv.css({
                backgroundImage: 'url(' + background + ')',
                backgroundPosition: 'center calc(50% - 200px)'
            });

            if (!iframeShown) {
                $iframe.show();
            }
        };

        scope.$on('setBackgroundImage', setBackground);
    };
}).directive('hlCropper', [

    function () {
        return function (scope, element, attrs) {
            scope.$watch(attrs.cropperOptions, function (newVal) {
                if (newVal) {
                    init(newVal);
                }
            });

            var cropperOptions,
                $editorImage = element.find('.original-image').children('img').eq(0),
                $previewImage = element.find('.preview-image').children('img').eq(0);

            var init = function (_cropperOptions) {
                cropperOptions = _cropperOptions;
                element.addClass('showed');
                $editorImage[0].src = cropperOptions.dataURL;
                $editorImage.Jcrop();
                $previewImage[0].src = cropperOptions.dataURL;
            };
        };
    }
]).directive('hlBackgroundLocalImage', ['Background', '$rootScope', 'Analytics',
    function (Background, $rootScope, Analytics) {
        return function (scope, element) {
            var $preview = element.find('.preview').eq(0),
                $loader = $preview.find('.loader').eq(0),
                $previewIMG = $preview.children().eq(0),
                $file = element.find('input[type=file]').eq(0),
                $remoteUrl = element.find('input[type=text]').eq(0);

            $file.on('change', function () {
                var oFReader = new FileReader();
                oFReader.readAsDataURL($file[0].files[0]);

                oFReader.onload = function (oFREvent) {
                    $previewIMG[0].src = oFREvent.target.result;
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage(oFREvent.target.result).then(function () {
                        Analytics.reportEvent(705, {
                            label: 'file'
                        });
                        console.log('finished uploading');
                        $loader.removeClass('showed');
                        $preview.hide();
                    }, function (e) {
                        $loader.removeClass('showed');
                        $preview.hide();
                        console.error('error:', e);
                    });
                };
            });

            $remoteUrl.on('keyup', function (e) {
                if (e.keyCode === 13 && $(this).val()) {
                    $previewIMG[0].src = $(this).val();
                    $preview.show();
                    $loader.addClass('showed');
                    Background.uploadNewLocalImage($(this).val()).then(function () {
                        Analytics.reportEvent(705, {
                            label: 'url'
                        });

                        $loader.removeClass('showed');
                        $preview.hide();
                    }, function (e) {
                        $loader.removeClass('showed');
                        $preview.hide();
                        console.error('error:', e);
                    });
                }
            });

            scope.$watch(function () {
                return Background.background;
            }, function (newVal) {
                if (!newVal.isLocalBackground) {
                    $preview.hide();
                }
            }, true);

            scope.isSelectedLocal = function () {
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
