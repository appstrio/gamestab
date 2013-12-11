define(['jquery'], function async_filesystem($local) {
    console.log('fs');
    var self = {}, deferred = new $local.Deferred();

    self.errorHandler = function(e) {
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

            console.error('FileSystem Error: ' + msg);
    };

    self.write = function filesStorageService_write(fileName, type, content, done) {

        try {
            self.fs.root.getFile(fileName, {create: true}, function filesStorageService_write_getFile(fileEntry) {

                // Create a FileWriter object for our FileEntry (log.txt).
                fileEntry.createWriter(function filesStorageService_write_getFile_createWriter(fileWriter) {

                    fileWriter.onwriteend = function filesStorageService_write_getFile_createWriter_onwriteend(e) {
                        done && done(null, fileEntry.toURL());
                    };

                    fileWriter.onerror = function filesStorageService_write_getFile_createWriter_onerror(e) {
                        done && done('err');
                    };


                    //if base 64 data so take only the data
                    if (type == "image/jpeg" || type == "image/png") {
                        var binaryImg = atob(content);
                        var length = binaryImg.length;
                        content = new ArrayBuffer(length);
                        var ua = new Uint8Array(content);
                        for (var i = 0; i < length; i++) {
                            ua[i] = binaryImg.charCodeAt(i);
                        }
                    }

                    // Create a new Blob and write it to log.txt.
                    var blob = new Blob([content], {type: type });

                    fileWriter.write(blob);

                }, self.errorHandler);

            }, self.errorHandler);
        } catch (e) {
            console.error('Error write',e);

        }
    };

    self.read = function filesStorageService_read(fileName, done) {
        try {
            self.fs.root.getFile(fileName, {}, function filesStorageService_read_getFile(fileEntry) {
                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function filesStorageService_read_getFile_file(file) {
                    var reader = new FileReader();

                    reader.onloadend = function filesStorageService_read_getFile_file_onloadend(e) {
                        done && done(this.result);
                    };

                    reader.readAsText(file);
                }, errorHandler);

            }, self.errorHandler);
        } catch (e) {
            console.error('Error read',e);
        }
    };

    self.append = function filesStorageService_append(fileName, type, content, done) {
        try {
            fs.root.getFile(fileName, {create: false}, function (fileEntry) {

                // Create a FileWriter object for our FileEntry (log.txt).
                fileEntry.createWriter(function (fileWriter) {

                    fileWriter.seek(fileWriter.length); // Start write position at EOF.

                    // Create a new Blob and write it to log.txt.
                    var blob = new Blob([content], {type: type});

                    fileWriter.write(blob);
                    done && done(fileEntry.toURL());

                }, errorHandler);

            }, self.errorHandler);
        } catch (e) {
          console.error('Error append',e);
        }
    };

    self.remove = function filesStorageService_remove(fileName, done) {
        try {
            fs.root.getFile(fileName, {create: false}, function filesStorageService_remove_getFile(fileEntry) {

                fileEntry.remove(function filesStorageService_remove_getFile_remove() {
                    done && done();
                }, self.errorHandler);

            }, self.errorHandler);
        } catch (e) {
        }
    };

    self.removeByPath = function filesStorageService_removeByPath(path, done) {
        if (path) {
            var split = path.split('/');
            if (split.length > 0) {
                remove(split[split.length - 1], done);
            } else {
                done && done(null, 'not a valid path');
            }
        } else {
            done && done(null, 'not a valid path');
        }
    };

    self.init = (function() {
        try {
            //support change in file system api prefix
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            var fileSystemSize = 10 * 1024 * 1024, // in byts =10 megabits
                apiType = window.PERSISTENT,  // or window.TEMPORARY

                storageType = {
                    persistent: 'webkitPersistentStorage',
                    temporary: 'temporaryStorage'
                };

            /**
             * New Version
             */
            navigator[storageType.persistent].requestQuota(fileSystemSize, function filesStorageService_init_requestQuota(grantedBytes) {
                window.requestFileSystem(apiType, grantedBytes, function onInitFs(fileSystem){
                    //file system open listener
                    self.fs = fileSystem;
                    self.fsReady = true;console.log('fs finished');
                    deferred.resolve(self);
                }, function(err) {            console.log('fs finished');
                    deferred.reject(err);
                    self.errorHandler.apply(arguments);
                });
            }, function fileStorageService_init_requestQuota_error (e) {
                deferred.reject(err);
            });
        } catch (err) {
            deferred.reject(err);
        }
    })();

    return deferred.promise();
});