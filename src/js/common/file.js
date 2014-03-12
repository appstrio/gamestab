angular.module('aio.file', []);

angular.module('aio.file').factory('FileSystem', ['$rootScope', '$log', '$q',
    function filesStorageService_Main($rootScope, $log, $q) {
        //vars
        var fs = null,
            fsReady = false,
            initting = $q.defer();

        /**
         * errorHandler
         * file system error handler
         * @param defer
         * @return
         */
        var errorHandler = function (deferred) {
            return function (e) {
                $log.error('[Filesystem]', e.name, e.message);
                deferred.reject(e);
            };
        };

        /**
         * filesStorageService_write
         *
         * @param fileName
         * @param content
         * @param type
         * @return
         */
        var write = function (fileName, content, type) {
            var deferred = $q.defer();
            init().then(function () {
                fs.root.getFile(fileName, {
                    create: true
                }, function (fileEntry) {
                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function () {
                            $rootScope.$apply(function () {
                                deferred.resolve(fileEntry.toURL());
                            });
                        };

                        //use handler on error
                        fileWriter.onerror = errorHandler(deferred);

                        //assign base64 regex to check & split
                        var base64Regex = /data:image\/(jpeg|jpg|png);base64,/;
                        var uIntBinaryArray;

                        //if base 64 image so extract only the data
                        if (base64Regex.test(content)) {
                            //split image by regex
                            var splittedContent = content.split(base64Regex);
                            // splittedContent = ['', 'image/png', 'asdflkjdfdkfjsdfsdflksdfjksdf']
                            //get type
                            type = 'image/' + splittedContent[1];
                            //get content and convert to binary
                            content = atob(splittedContent[2]);
                            uIntBinaryArray = new Uint8Array(new ArrayBuffer(content.length));
                            for (var i = 0; i < content.length; i++) {
                                uIntBinaryArray[i] = content.charCodeAt(i);
                            }
                        }

                        var blob = new Blob([uIntBinaryArray], {
                            type: type
                        });

                        //actually write file
                        fileWriter.write(blob);
                    }, errorHandler(deferred));
                }, errorHandler(deferred));
            }, function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        };

        /**
         * filesStorageService_read
         *
         * @param fileName
         * @return
         */
        var read = function filesStorageService_read(fileName) {
            var deferred = $q.defer();

            init().then(function () {
                try {
                    fs.root.getFile(fileName, {}, function filesStorageService_read_getFile(fileEntry) {
                        // Get a File object representing the file,
                        // then use FileReader to read its contents.
                        fileEntry.file(function filesStorageService_read_getFile_file(file) {
                            var reader = new FileReader();

                            reader.onloadend = function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve(this.result);
                                });
                            };

                            reader.readAsText(file);
                        }, errorHandler(deferred));
                    }, errorHandler(deferred));
                } catch (e) {
                    $log.info('Error reading file', e);
                    $rootScope.$apply(function () {
                        deferred.reject(e);
                    });
                }
            }, deferred.reject);

            return deferred.promise;
        };

        /**
         * filesStorageService_append
         *
         * @param fileName
         * @param type
         * @param content
         * @return
         */
        var append = function filesStorageService_append(fileName, type, content) {
            var deferred = $q.defer();

            init().then(function () {
                try {
                    fs.root.getFile(fileName, {
                        create: false
                    }, function (fileEntry) {

                        // Create a FileWriter object for our FileEntry (log.txt).
                        fileEntry.createWriter(function (fileWriter) {

                            fileWriter.seek(fileWriter.length); // Start write position at EOF.

                            // Create a new Blob and write it to log.txt.
                            var blob = new Blob([content], {
                                type: type
                            });

                            fileWriter.write(blob);
                            $rootScope.$apply(function () {
                                deferred.resolve(fileEntry.toURL());
                            });

                        }, errorHandler(deferred));
                    }, errorHandler(deferred));
                } catch (e) {
                    $log.info('Error', e);
                    $rootScope.$apply(function () {
                        deferred.reject(e);
                    });
                }
            }, deferred.reject);

            return deferred.promise;
        };

        /**
         * filesStorageService_remove
         *
         * @param fileName
         * @return
         */
        var remove = function filesStorageService_remove(fileName) {
            var deferred = $q.defer();

            init().then(function () {
                try {
                    fs.root.getFile(fileName, {
                        create: false
                    }, function filesStorageService_remove_getFile(fileEntry) {
                        fileEntry.remove(function () {
                            $log.info('File removed.');
                            $rootScope.$apply(function () {
                                deferred.resolve();
                            });
                        }, errorHandler(deferred));
                    }, errorHandler(deferred));
                } catch (e) {
                    $log.info('Error', e);
                    $rootScope.$apply(function () {
                        deferred.reject(e);
                    });
                }
            }, deferred.reject);

            return deferred.promise;
        };

        /**
         * filesStorageService_removeByPath
         *
         * @param path
         * @return
         */
        var removeByPath = function filesStorageService_removeByPath(path) {
            var deferred = $q.defer();

            init().then(function () {
                if (path) {
                    var split = path.split('/');
                    if (split.length > 0) {
                        $rootScope.$apply(function () {
                            deferred.resolve();
                        });
                        //returns a promise as well
                        return remove(split[split.length - 1]);
                    } else {
                        $rootScope.$apply(function () {
                            deferred.reject('not a valid path');
                        });
                    }
                } else {
                    $rootScope.$apply(function () {
                        deferred.reject('not a valid path');
                    });
                }
            }, deferred.reject);

            return deferred.promise;
        };

        /**
         * filesStorageService_getFileUrlByFileName
         *
         * @param fileName
         * @return
         */
        var getFileUrlByFileName = function filesStorageService_getFileUrlByFileName(fileName) {
            var deferred = $q.defer();

            init().then(function () {
                var createObject = {
                    create: false
                };

                fs.root.getFile(fileName, createObject, function (fileEntry) {
                    var url;
                    if (fileEntry) {
                        url = fileEntry.toURL();
                    }
                    $rootScope.$apply(function () {
                        deferred.resolve(url);
                    });
                }, errorHandler(deferred));
            }, deferred.reject);

            return deferred.promise;
        };

        /**
         * filesStorageService_init
         * init window file system api
         *
         * @return
         */
        var init = function filesStorageService_init() {

            //support change in file system api prefix
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            var fileSystemSize = 10 * 1024 * 1024, // in byts =10 megabits
                // apiType = window.PERSISTENT,
                apiType = window.TEMPORARY,

                storageType = {
                    persistent: 'webkitPersistentStorage',
                    temporary: 'webkitTemporaryStorage'
                };

            try {
                /**
                 * New Version
                 */
                navigator[storageType.temporary].requestQuota(fileSystemSize, function (grantedBytes) {
                    window.requestFileSystem(apiType, grantedBytes, function (fileSystem) {
                        $rootScope.$apply(function () {
                            fs = fileSystem;
                            fsReady = true;
                            initting.resolve(fs);
                            $log.info('Opened file system: ' + fs.name);
                        });

                    }, function (e) {
                        $rootScope.$apply(function () {
                            errorHandler(initting)(e);
                        });
                    });
                }, function fileStorageService_init_requestQuota_error(e) {
                    $log.error('Error init file system api', e);
                    initting.reject(e);
                });
            } catch (e) {
                $log.error('Error init file system api, caught an error : ', e);
                initting.reject(e);
            }

            return initting.promise;
        };

        return {
            promise: initting.promise,
            write: write,
            read: read,
            append: append,
            remove: remove,
            removeByPath: removeByPath,
            getFileUrlByFileName: getFileUrlByFileName
        };
    }
]);
