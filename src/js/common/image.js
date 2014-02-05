var imageModule = angular.module('aio.image', []);

imageModule.factory('Image', ['$q', '$rootScope', 'FileSystem',
    function($q, $rootScope, FileSystem) {

        /**
         * urlToBase64
         *
         * @param params
         * @param params.url
         * @param [params.maxWidth]
         * @param [params.maxHeight]
         * @param [params.fixedSize]
         * @return
         */
        var urlToBase64 = function(params) {
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
                $rootScope.$apply(function() {
                    deferred.reject('Missing url to convert to base64');
                });
                return deferred.promise;
            }

            options = angular.extend({
                maxWidth: 0,
                maxHeight: 0,
                fixedSize: 0
            }, params);

            //img load event
            img.onload = function() {
                // Draw original image in second canvas
                try {
                    canvasCopy.width = img.width;
                    canvasCopy.height = img.height;

                    ctxCopy.drawImage(img, 0, 0);

                    //check if resize is not needed
                    if (!options.maxWidth && !options.maxHeight && !options.fixedHeight && !options.fixedWidth) {
                        $rootScope.$apply(function() {
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
                    $rootScope.$apply(function() {
                        deferred.resolve(canvas.toDataURL());
                    });
                } catch (e) {
                    $rootScope.$apply(function() {
                        deferred.reject(e);
                    });
                }
            };

            // Create original image
            img = new Image();
            img.src = url;

            return deferred.promise;
        };

        /**
         * imageService_urlToFile
         * save url or base64 string to the file system
         * @param params
         * @param params.url
         * @param params.resizeOptions
         * @return promise
         */
        var urlToLocalFile = function(params) {
            var deferred = $q.defer();
            params = params || {};

            //TODO verify if file exists first

            //file doesn't exist, generate it as base64
            urlToBase64(params).then(function(base64) {
                //default type
                var type = 'image/jpeg';
                var fileName, typeForFileName;

                //assign base64 regex to check & split
                var base64Regex = /data:image\/(jpeg|jpg|png);base64,/;

                //if base 64 image so extract only the data
                if (base64Regex.test(base64)) {
                    //split image by regex
                    var splittedContent = base64.split(base64Regex);
                    // splittedContent = ['', 'image/png', 'asdflkjdfdkfjsdfsdflksdfjksdf']
                    //get type
                    type = 'image/' + splittedContent[1];
                }

                typeForFileName = type.split('/')[1];
                fileName = _getHashFromName(params.prefix, params.url, typeForFileName);

                //generate unique name to each thumbnail
                FileSystem.write(fileName, type, base64, function(file) {
                    $rootScope.$apply(function() {
                        deferred.resolve(file);
                    });
                });
            }).
            catch (function(e) {
                $rootScope.$apply(function() {
                    deferred.reject(e);
                });
            });

            return deferred.promise;
        };


        /**
         * _getHashFromName
         * generate filename before saving in the filesystem,
         * using a simple hash function to run on the url.
         * The url is either the url of the image or the url of the page being captured
         *
         * @private
         * @param prefix
         * @param url
         * @param type
         * @return
         */
        var _getHashFromName = function(prefix, url, type) {
            if (!url) {
                return null;
            }

            prefix = prefix || '';
            type = type;
            return prefix + url.hashCode() + '.' + type;
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
            urlToLocalFile: urlToLocalFile
        };
    }
]);
