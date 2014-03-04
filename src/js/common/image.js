angular.module('aio.image', []);
angular.module('aio.image').factory('Image', ['$q', '$rootScope', '$log', 'FileSystem',
    function ($q, $rootScope, $log, FileSystem) {

        var isBlackContrast = function (rgb) {
            var gamma = 2.2;
            var l = 0.2126 * Math.pow(rgb.red / 100, gamma) +
                0.7152 * Math.pow(rgb.green / 100, gamma) +
                0.0722 * Math.pow(rgb.blue / 100, gamma);

            return l > 0.5;
        };

        //todo extract
        function loop(x, y, callback) {
            var i, j;

            for (i = 0; i < x; i++) {
                for (j = 0; j < y; j++) {
                    callback(i, j);
                }
            }
        }

        //todo extract
        function parseImage(sourceImageData, width, height) {
            var data = {};

            var pixelCount = 0;
            var redTotal = 0;
            var greenTotal = 0;
            var blueTotal = 0;


            loop(height, width, function (verticalPos, horizontalPos) {
                var offset = (verticalPos * width + horizontalPos) * 4;
                var red = sourceImageData[offset];
                var green = sourceImageData[offset + 1];
                var blue = sourceImageData[offset + 2];

                pixelCount++;

                redTotal += red / 255 * 100;
                greenTotal += green / 255 * 100;
                blueTotal += blue / 255 * 100;
            });

            data.red = Math.floor(redTotal / pixelCount);
            data.green = Math.floor(greenTotal / pixelCount);
            data.blue = Math.floor(blueTotal / pixelCount);

            return data;
        }

        var base64Regex = /data:image\/(jpeg|jpg|png);base64,/;
        /**
         * urlToBase64
         *
         * @param params
         * @param params.url
         * @param params.resizeOptions
         * @config maxWidth
         * @config maxHeight
         * @config fixedWidth
         * @config fixedHeight
         *
         * @return
         */
        var urlToBase64 = function (params) {
            var options = params.options || {};
            var url = params.url;

            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                canvasCopy = document.createElement('canvas'),
                ctxCopy = canvasCopy.getContext('2d'),
                img,
                deferred = $q.defer();

            //exit nicely
            if (!url) {
                $rootScope.$apply(function () {
                    deferred.reject('Missing url to convert to base64');
                });
                return deferred.promise;
            }

            options = angular.extend({
                maxWidth: 0,
                maxHeight: 0,
                fixedHeight: 0,
                fixedWidth: 0
            }, params.resizeOptions);

            // Create original image
            img = new Image();

            //img load event
            img.onload = function () {
                var comp;
                // Draw original image in second canvas
                canvasCopy.width = img.width;
                canvasCopy.height = img.height;

                ctxCopy.drawImage(img, 0, 0);

                /*
                 *                 if (params.checkContrast) {
                 *                     var imageData = ctxCopy.getImageData(0, 0, img.width, img.height);
                 *                     var imageRgb = parseImage(imageData.data, img.width, img.height);
                 *
                 *                     comp = isBlackContrast(imageRgb);
                 *                 }
                 */

                //check if resize is not needed
                if (!options.maxWidth && !options.maxHeight && !options.fixedHeight && !options.fixedWidth) {
                    return $rootScope.$apply(function () {
                        deferred.resolve(canvasCopy.toDataURL());
                    });
                }

                //resize is needed
                if (options.fixedWidth || options.fixedHeight) {
                    canvas.width = options.fixedWidth || img.width;
                    canvas.height = options.fixedHeight || img.height;
                } else {
                    options.maxWidth = options.maxWidth || img.width;
                    options.maxHeight = options.maxHeight || img.height;

                    // Determine new ratio based on max size
                    var ratio = 1;
                    if (img.width > options.maxWidth) {
                        ratio = options.maxWidth / img.width;
                    } else if (img.height > options.maxHeight) {
                        ratio = options.maxHeight / img.height;
                    }

                    // Copy and resize second canvas to first canvas
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                }

                ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

                $rootScope.$apply(function () {
                    deferred.resolve(canvas.toDataURL());
                });
            };
            img.onerror = function (e) {
                $rootScope.$apply(function () {
                    deferred.reject(e);
                });
            };

            //need for web cross domain requests
            img.crossOrigin = 'anonymous';
            img.src = url;

            return deferred.promise;
        };

        var isBase64 = function (data) {
            return base64Regex.test(data);
        };

        var getTypeFromBase64 = function (base64) {
            //split image by regex
            var splittedContent = base64.split(base64Regex);
            // splittedContent = ['', 'image/png', 'asdflkjdfdkfjsdfsdflksdfjksdf']
            //get type
            return 'image/' + splittedContent[1];
        };

        /**
         * imageService_urlToFile
         * save url or base64 string to the file system
         * @param params
         * @param params.url
         * @param params.resizeOptions
         * @return promise
         */
        var urlToLocalFile = function (params) {
            var deferred = $q.defer();
            params = params || {};
            var type;

            //get unique hash
            var fileName = _getHashFromUrl(params.url);

            //if url is already base64
            if (isBase64(params.url)) {
                type = getTypeFromBase64(params.url);

                //generate unique name to each thumbnail
                FileSystem.write(fileName, params.url, type).then(function (file) {
                    deferred.resolve(file);
                });
            } else {
                //file doesn't exist, generate it as base64
                urlToBase64(params).then(function (base64) {
                    type = getTypeFromBase64(base64);
                    //generate unique name to each thumbnail
                    FileSystem.write(fileName, base64, type).then(function (file) {
                        deferred.resolve(file);
                    });
                }).then(angular.noop, function (e) {
                    //error handling
                    $log.log('[Image] - error saving remote image', e);
                    deferred.reject(e);
                });
            }

            return deferred.promise;
        };

        var helpers = {
            isPathFileSystem: function (field) {
                return /^filesystem/.test(field);
            },
            isPathRemote: function (field) {
                return /^https?/.test(field);
            },
            isPathChrome: function (field) {
                return /^chrome(?!:\/\/extension-icon)/.test(field);
            }
        };

        /**
         * generateThumbnail
         *
         * @param urlField
         * @param params
         * @param arr
         * @return
         */
        var generateThumbnail = function (urlField, params, arr) {
            var counter = 0;
            var promiseChain = $q.when();
            params = params || {};

            arr.forEach(function (item) {
                (function (item, counter) {
                    var url = item[urlField];
                    //extend to newParams
                    var newParams = angular.extend({
                        url: url
                    }, params);

                    promiseChain = promiseChain.then(function () {
                        return urlToLocalFile(newParams);
                    }).then(function (file) {
                        item.thumbnail = file;
                        $log.log('[Image] - generating thumbnail ' +
                            urlField + ' => ' + counter + '/' + arr.length + '.');
                        return arr;
                    });
                })(item, ++counter);
            });

            return promiseChain;
        };

        /**
         * convertFieldToLocalFile
         * converts all the relevant fields to local images
         *
         * @param fieldToConvert
         * @param [params]
         * @param {Object[]} arr
         * @return
         */
        var convertFieldToLocalFile = function (fieldToConvert, params, arr) {
            var counter = 0;
            var promises = [];

            params = params || {};

            function logAndReturn(item) {
                $log.log('[image] - caching ' + fieldToConvert + '=> ' + counter + '/' + arr.length + '.');
                return promises.push(item);
            }

            arr.forEach(function (item) {
                var url = item[fieldToConvert];
                ++counter;
                // save original url
                item.originalUrl = url;

                //check if path starts with chrome or filesystem
                if (helpers.isPathChrome(url) || helpers.isPathFileSystem(url)) {
                    return logAndReturn(item);
                }

                /*
                 * DEPRECATED 3.3.14 - using background to cache all local images
                 * //is path a local one?
                 * if (!helpers.isPathRemote(url)) {
                 *     //save absolute chrome path
                 *     item[fieldToConvert] = Chrome.extension.getURL(url);
                 *     return logAndReturn(item);
                 * }
                 */
                (function (counter) {
                    $log.log('[image] - caching ' + fieldToConvert + '=> ' + counter + '/' + arr.length + '.');
                    //return promise
                    promises.push(urlToLocalFile(angular.extend({
                        url: url
                    }, params)).then(function (file) {
                        //save new url
                        item[fieldToConvert] = file;
                        return item;
                    }));
                })(counter);
            });

            return $q.all(promises);
        };

        /**
         * _getHashFromUrl
         * generate filename before saving in the filesystem,
         * using a simple hash function to run on the url.
         * The url is either the url of the image or the url of the page being captured
         *
         * Needs Unit Test
         *
         * @see http://stackoverflow.com/q/7616461/940217
         * @private
         * @param url
         * @return {number}
         */
        var _getHashFromUrl = function (url) {
            if (typeof url !== 'string') {
                url = String(url);
            }
            return url.split('').reduce(function (a, b) {
                //jshint bitwise:false
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
        };

        return {
            /*
             * legacy aliaas
             */
            getBase64Image: urlToBase64,
            urlToFile: urlToLocalFile,

            /*
             * PUBLIC API
             */

            // urlToBase64  @params(url), @returns(promise(base64_image, resize_options))
            urlToBase64: urlToBase64,
            // urlToLocalFile @params({url:XXX,filename :XXX, resize_options}, #returns(promise(localfile_url)
            urlToLocalFile: urlToLocalFile,
            convertFieldToLocalFile: convertFieldToLocalFile,
            generateThumbnail: generateThumbnail,

            helpers: helpers
        };
    }
]);
