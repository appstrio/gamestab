/* global _ */
angular.module('aio.settings').factory('Background', [
    '$rootScope', 'Storage', '$q', 'Image', '$log', 'Constants', 'Chrome', 'Helpers', 'Config',
    function ($rootScope, Storage, $q, Image, $log, C, Chrome, Helpers, Config) {
        var isReady = $q.defer(),
            //stores user added backgrounds
            storageKey = C.STORAGE_KEYS.BACKGROUNDS,
            //the active background
            background = {},
            //list of remote backgorunds
            backgrounds = [],
            //list of custom backgrounds
            userBackgrounds = [];

        var thumbnailResizeParams = {
            resizeOptions: {
                fixedHeight: 160,
                fixedWidth: 160
            }
        };

        var getBackgrounds = function () {
            return backgrounds.concat(userBackgrounds);
        };

        var getUserBackgrounds = function () {
            return Helpers.loadFromStorage(storageKey);
        };

        var fetchBackgrounds = function () {
            var backgroundsUrl = Config.get().backgrounds_json_url;
            return Helpers.loadRemoteJson(backgroundsUrl)
                .then(parseBackgrounds)
                .then(getUserBackgrounds)
                .then(function (items) {
                    userBackgrounds = items;
                }, function () {
                    console.log('No user backgrounds in storage');
                });
        };

        var addBgToUserBgs = function (bg) {
            userBackgrounds.push(angular.copy(bg));
            //and store it
            return storeUserBackgrounds();
        };

        var setup = function () {
            //get config
            var conf = Config.get();
            //background image is what user selects, or the default one (our default or partner's)
            var url = conf.user_preferences &&
            //user selected background
            conf.user_preferences.background_image ||
            //or partner/default background
            conf.default_background_url ||
            //or hard-set background
            C.FALLBACK_BACKGROUND_URL;
            console.debug('[Backgorund] - using the following url for background:', url);
            var newBg = getCustomBgObj(url);
            return Image.generateThumbnail('url', thumbnailResizeParams, [newBg])
                .then(function (newBackground) {
                    //make it the active one
                    return setNewBackground(newBackground[0]);
                })
                .then(function () {
                    isReady.resolve(background);
                    return addBgToUserBgs(background);
                });
        };

        //try to get user preferences from config object
        var init = function () {
            // console.debug('[Background] - init');
            var deferred = $q.defer();

            var conf = Config.get();
            var backgroundImage = conf && conf.user_preferences && conf.user_preferences.background_image;
            //background is already set
            if (backgroundImage && backgroundImage.url) {
                assignBackground(backgroundImage);
                deferred.resolve(background);
                isReady.resolve(background);
            } else {
                deferred.reject();
            }

            return deferred.promise;
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
            //reset current backgrounds
            backgrounds.length = 0;
            _.each(paths, function (filesInPath) {
                _.each(filesInPath.files, function (img) {
                    backgrounds.push({
                        url: filesInPath.path + img.image,
                        thumbnail: filesInPath.path + filesInPath.thumbnail_path + img.image,
                    });
                });
            });

            $log.log('[Background] - found # number of backgrounds', backgrounds.length);
            return backgrounds;
        };

        //assign runtime background object
        var assignBackground = function (newBackground) {
            angular.extend(background, newBackground);
            return background;
        };

        // store background object in the localStorage
        var setNewBackground = function (newBackground) {
            var __conf;
            return Image.convertFieldToLocalFile('url', {}, [newBackground]).then(function (_background) {
                //assign to runtime object
                assignBackground(_background[0]);
                var conf = Config.get();
                //point in config
                conf.user_preferences.background_image = background;
                __conf = conf;
                return Image.contrastFromUrl(background.url);
            }).then(function (blackArrows) {
                __conf.user_preferences.use_black_arrows = blackArrows;
                Config.setConfig(__conf);
                return Config.set();
            });
        };

        var getCustomBgObj = function (file) {
            return {
                url: file,
                isCustom: true,
                timestamp: Date.now(),
            };
        };

        // handle image file uploads
        var uploadNewLocalImage = function (dataURL) {
            return Image.urlToLocalFile({
                url: dataURL,
                resizeOptions: {
                    maxWidth: 1024
                }
            }).then(function (file) {
                var newBackground = getCustomBgObj(file);
                //app has no original url
                newBackground.originalUrl = newBackground.url;
                return Image.generateThumbnail('url', thumbnailResizeParams, [newBackground]);
            }).then(function (newBackground) {
                //make it the active one
                return setNewBackground(newBackground[0]);
            }).then(function () {
                return addBgToUserBgs(background);
            });
        };

        var storeUserBackgrounds = function () {
            return Helpers.store(storageKey, userBackgrounds);
        };

        return {
            isReady: isReady.promise,
            background: background,
            init: init,
            setup: setup,
            //from server
            fetchBackgrounds: fetchBackgrounds,
            //from runtime object
            getBackgrounds: getBackgrounds,
            setNewBackground: setNewBackground,
            uploadNewLocalImage: uploadNewLocalImage
        };
    }
]).directive('hlBackground', ['Background',
    function (Background) {
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
            scope.background = Background.background;

            //watch for background changes and set them
            scope.$watch('background.url', function (background) {
                if (!background) {
                    return;
                }
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
            });
        };
    }
]).directive('hlCropper', [

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

            function finishNewImg(type) {
                Analytics.reportEvent(705, {
                    label: type
                });
                $loader.removeClass('showed');
                $preview.hide();
            }

            function errFinishNewImg(e) {
                $loader.removeClass('showed');
                $preview.hide();
                console.error('error:', e);
            }

            var setNewBackground = function (img, type) {
                $previewIMG[0].src = img;
                $preview.show();
                $loader.addClass('showed');

                Background.uploadNewLocalImage(img)
                    .then(scope.refreshBackgrounds)
                    .then(finishNewImg.bind(null, type), errFinishNewImg);
            };

            $file.on('change', function () {
                var oFReader = new FileReader();
                oFReader.readAsDataURL($file[0].files[0]);

                oFReader.onload = function (oFREvent) {
                    var img = oFREvent.target.result;
                    setNewBackground(img, 'file');
                };
            });

            $remoteUrl.on('keyup', function (e) {
                var $elm = $(this);
                //if enter key and there is a value in the input
                if (e.keyCode === 13 && $elm.val()) {
                    var img = $elm.val();
                    setNewBackground(img, 'url');
                }
            });
        };
    }
]);
