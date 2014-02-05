/* global FileError */
var fileModule = angular.module('aio.file', []);

fileModule.factory('FileSystem', ['$rootScope', '$log', '$q',
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
        var errorHandler = function(deferred) {
            return function filesStorageService_errorHandler(e) {
                var msg = '';
                switch (e.code) {
                    case FileError.QUOTA_EXCEEDED_ERR:
                        msg = 'QUOTA_EXCEEDED_ERR';
                        break;
                    case FileError.NOT_FOUND_ERR:
                        msg = 'NOT_FOUND_ERR';
                        break;
                    case FileError.SECURITY_ERR:
                        msg = 'SECURITY_ERR';
                        break;
                    case FileError.INVALID_MODIFICATION_ERR:
                        msg = 'INVALID_MODIFICATION_ERR';
                        break;
                    case FileError.INVALID_STATE_ERR:
                        msg = 'INVALID_STATE_ERR';
                        break;
                    default:
                        msg = 'Unknown Error';
                        break;
                }

                $log.info('Filesystem error: ' + msg);
                deferred.reject(msg);
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
        var write = function filesStorageService_write(fileName, content, type) {
            var deferred = $q.defer();
            try {
                fs.root.getFile(fileName, {
                    create: true
                }, function filesStorageService_write_getFile(fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function(fileWriter) {

                        fileWriter.onwriteend = function() {
                            $log.info('Write completed. ', fileEntry.toURL());
                            $rootScope.$apply(function() {
                                deferred.resolve(fileEntry.toURL());
                            });
                        };

                        fileWriter.onerror = function(e) {
                            $log.info('Write failed: ' + e.toString());
                            deferred.reject(e);
                        };

                        //assign base64 regex to check & split
                        var base64Regex = /data:image\/(jpeg|jpg|png);base64,/;

                        //if base 64 image so extract only the data
                        if (base64Regex.test(content)) {
                            //split image by regex
                            var splittedContent = content.split(base64Regex);
                            //get type
                            type = 'image/' + splittedContent[1];
                            //get content
                            content = splittedContent[2];
                        }

                        if (type === 'image/jpeg' || type === 'image/png') {
                            var binaryImg = atob(content);
                            var length = binaryImg.length;
                            content = new ArrayBuffer(length);
                            var ua = new Uint8Array(content);
                            for (var i = 0; i < length; i++) {
                                ua[i] = binaryImg.charCodeAt(i);
                            }
                        }

                        // Create a new Blob and write it to log.txt.
                        var blob = new Blob([content], {
                            type: type
                        });

                        fileWriter.write(blob);

                    }, errorHandler(deferred));

                }, errorHandler(deferred));
            } catch (e) {
                deferred.reject(e);
                $log.info('Error', e);
            }

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
            try {
                fs.root.getFile(fileName, {}, function filesStorageService_read_getFile(fileEntry) {
                    // Get a File object representing the file,
                    // then use FileReader to read its contents.
                    fileEntry.file(function filesStorageService_read_getFile_file(file) {
                        var reader = new FileReader();

                        reader.onloadend = function() {
                            deferred.resolve(this.result);
                        };

                        reader.readAsText(file);
                    }, errorHandler(deferred));
                }, errorHandler(deferred));
            } catch (e) {
                $log.info('Error reading file', e);
                deferred.reject(e);
            }

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
            try {
                fs.root.getFile(fileName, {
                    create: false
                }, function(fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function(fileWriter) {

                        fileWriter.seek(fileWriter.length); // Start write position at EOF.

                        // Create a new Blob and write it to log.txt.
                        var blob = new Blob([content], {
                            type: type
                        });

                        fileWriter.write(blob);
                        deferred.resolve(fileEntry.toURL());

                    }, errorHandler(deferred));

                }, errorHandler(deferred));
            } catch (e) {
                $log.info('Error', e);
            }

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

            try {
                fs.root.getFile(fileName, {
                    create: false
                }, function filesStorageService_remove_getFile(fileEntry) {

                    fileEntry.remove(function filesStorageService_remove_getFile_remove() {
                        $log.info('File removed.');
                        deferred.resolve();
                    }, errorHandler(deferred));

                }, errorHandler(deferred));
            } catch (e) {
                $log.info('Error', e);
            }

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

            if (path) {
                var split = path.split('/');
                if (split.length > 0) {
                    return remove(split[split.length - 1]);
                } else {
                    deferred.reject('not a valid path');
                }
            } else {
                deferred.reject('not a valid path');
            }

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

            var createObject = {
                create: false
            };

            fs.root.getFile(fileName, createObject, function(fileEntry) {
                var url;
                if (fileEntry) {
                    url = fileEntry.toURL();
                }
                deferred.resolve(url);
            }, function filesStorageService_getFileUrlByFileName_second_param(e) {
                deferred.reject(e);
                errorHandler(e);
            });

            return deferred.promise;
        };

        /**
         * filesStorageService_init
         * init window file system api
         *
         * @return
         */
        var init = function filesStorageService_init() {
            try {
                //support change in file system api prefix
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                var fileSystemSize = 10 * 1024 * 1024, // in byts =10 megabits
                    apiType = window.PERSISTENT, // or window.TEMPORARY

                    //TODO need more research as to what type is better for us to store
                    storageType = {
                        persistent: 'webkitPersistentStorage',
                        temporary: 'temporaryStorage'
                    };

                /**
                 * New Version
                 */
                navigator[storageType.persistent].requestQuota(fileSystemSize, function(grantedBytes) {
                    window.requestFileSystem(apiType, grantedBytes, function(fileSystem) {
                        $rootScope.$apply(function() {
                            fs = fileSystem;
                            fsReady = true;
                            initting.resolve();
                            $log.info('Opened file system: ' + fs.name);
                        });

                    }, errorHandler(initting));
                }, function fileStorageService_init_requestQuota_error(e) {
                    $log.info('Error init file system api', e);
                });

            } catch (e) {
                $log.info('Error init file system api, caught an error : ', e);
            }
        };

        init();

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
