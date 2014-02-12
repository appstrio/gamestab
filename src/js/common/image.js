/* global async,_ */
var imageModule = angular.module('aio.image', []);

imageModule.factory('Image', ['$q', '$rootScope', 'FileSystem', '$log', 'Chrome',
    function ($q, $rootScope, FileSystem, $log, Chrome) {

        var base64Regex = /data:image\/(jpeg|jpg|png);base64,/;
        /**
         * urlToBase64
         *
         * @param params
         * @param params.url
         * @param params.resizeOptions
         * @config maxWidth
         * @config maxHeight
         * @config fixedSize
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
                fixedSize: 0
            }, params.resizeOptions);

            // Create original image
            img = new Image();

            //img load event
            img.onload = function () {
                // Draw original image in second canvas
                canvasCopy.width = img.width;
                canvasCopy.height = img.height;

                ctxCopy.drawImage(img, 0, 0);

                //check if resize is not needed
                if (!options.maxWidth && !options.maxHeight && !options.fixedHeight && !options.fixedWidth) {
                    $rootScope.$apply(function () {
                        deferred.resolve(canvasCopy.toDataURL());
                    });
                    return;
                }

                //resize is needed

                if (options.fixedSize) {
                    canvas.width = options.fixedSize.width || img.width;
                    canvas.width = options.fixedSize.height || img.height;
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

                ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width,
                    canvasCopy.height, 0, 0, canvas.width, canvas.height);

                $rootScope.$apply(function () {
                    deferred.resolve(canvas.toDataURL());
                });
            };
            img.onerror = function (e) {
                $rootScope.$apply(function () {
                    deferred.reject(e);
                });
            };

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

        /**
         * isPathLocal
         * Checks if field is local
         * local field has 'filesystem:chrome-extension' or doesn't beging with http/https
         *
         * @param field
         * @return
         */
        var isPathLocal = function (field) {
            if (/^filesystem:chrome-extension/.test(field)) {
                return true;
            }
            if (/^https?/.test(field)) {
                return false;
            }


            return true;
        };

        /**
         * convertFieldToLocalFile
         * converts all the relevant fields to local images
         *
         * @param fieldToConvert
         * @param {Object[]} arr
         * @return
         */
        var convertFieldToLocalFile = function (fieldToConvert, arr) {
            var counter = 0;
            var deferred = $q.defer();

            async.eachSeries(arr, function (item, callback) {
                    ++counter;
                    $log.log('[Image] - caching ' + fieldToConvert + '=> ' + counter + '/' + arr.length + '.');
                    //if field is local, don't change it
                    if (isPathLocal(item[fieldToConvert])) {
                        // save original url
                        item.originalUrl = item[fieldToConvert];
                        if (/^chrome/.test(item[fieldToConvert])) {
                            return callback();
                        }
                        //save absolute chrome path
                        item[fieldToConvert] = Chrome.extension.getURL(item[fieldToConvert]);
                        return callback();
                    }

                    urlToLocalFile({
                        url: item[fieldToConvert]
                    }).then(function (file) {
                        // save original url
                        item.originalUrl = item[fieldToConvert];
                        //save new url
                        item[fieldToConvert] = file;
                        return callback();
                    }, callback);
                },
                function () {
                    _.defer(function () {
                        $rootScope.$apply(function () {
                            deferred.resolve(arr);
                        });
                    });
                });
            return deferred.promise;
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
            convertFieldToLocalFile: convertFieldToLocalFile
        };
    }
]);
