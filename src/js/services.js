app.factory('Apps', ['$rootScope', '$http','Storage', '$q','Chrome', function($rootScope, $http,Storage,$q,Chrome){
    var initting = $q.defer(),
        storageKey = 'gt.apps',
        apps;

    var systemApps = [
        {title : "Settings", icon :  './img/logo_icons/settings175x175.png', overlay:'settings', permanent : true},
        {title : "Apps Store", icon : './img/logo_icons/appstore175x175.png', overlay:'store', permanent : true}
    ];
    var init = function(){
        Storage.get(storageKey, function(items){
            if(items && items[storageKey] && angular.isArray(items[storageKey])){
                apps = items[storageKey];
                initting.resolve(apps);
            }else{
                firstTimeSetup(function(){
                    initting.resolve(apps);
                });
            }
        });
    };

    var firstTimeSetup = function (cb){
        appsDB().success(function(appsDB){
            var allTheApps = [];

            var all = _.filter(appsDB, function(app){
               return (app.default && app.default.indexOf('ALL') > -1);
            });

            all = all.slice(0,6);


            var games =  _.filter(appsDB, function(app){
                return (app.tags && app.tags.indexOf('Games') > -1);
            });

            games = _.shuffle(games).slice(0, 12);

            allTheApps = allTheApps.concat(systemApps);
            allTheApps = allTheApps.concat(all);
            allTheApps = allTheApps.concat(games);

            Chrome.management.getAll(function(chromeApps){
                $rootScope.$apply(function(){
                    var onlyAppsArr = [];
                    angular.forEach(chromeApps, function(appOrExtension){
                        if(appOrExtension.isApp && appOrExtension.enabled){
                            allTheApps.push(chromeAppToObject(appOrExtension));
                        }
                    });

                    var output = [], j = 0;
                    for(var i = 0; i < allTheApps.length; ++i){
                        if(i != 0 && i % 12 == 0) ++j;
                        output[j] = output[j] || [];
                        output[j].push(allTheApps[i]);
                    }

                    apps = output;

                    store(cb);

                });
            });

        });
    };



    var appsDB = function(){
        return $http.get('./data/webAppsDB1.json');
    }



    var chromeAppToObject = function(app){
        return {
            appLaunchUrl: app.appLaunchUrl,
            description: app.description,
            enabled: app.enabled,
            homepageUrl: app.homepageUrl,
            hostPermissions: app.hostPermissions,
            icons: app.icons,
            icon: getLargestIconChromeApp(app.icons).url,
            id: app.id,
            chromeId: app.id,
            installType: app.installType,
            isApp: app.isApp,
            mayDisable: app.mayDisable,
            name: app.name,
            title: app.name,
            offlineEnabled: app.offlineEnabled,
            optionsUrl: app.optionsUrl,
            permissions: app.permissions,
            shortName: app.shortName,
            type: app.type,
            version: app.version
        }
    }

    var getLargestIconChromeApp = function(iconsArr){
        var selected;
        if(!iconsArr.length) return null;

       for ( var i = 0 ; i < iconsArr.length; ++i){
           if(!selected){
               selected = iconsArr[i];
           }else{
               if(selected.size<iconsArr[i].size){
                   selected = iconsArr[i];
               }
           }
       }

        return selected;
    }


    var store = function(cb){
        var obj = {};
        obj[storageKey] = apps;
        Storage.set(obj, cb);
    };

    var addNewApp = function(app, cb){
        var lastAvailablePage = getLastAvailablePage();
        app.installTimestamp = Date.now();
        lastAvailablePage.push(app);
        store(cb);
    };

    var uninstallApp = function(app, cb){
        var found = false;
        angular.forEach(apps, function(page){
           angular.forEach(page, function(_app, index){
              if(app.url === _app.url){
                page.splice(index,1);
                store(cb);
                  found = true;
              }
           });
        });
        if(!found){
            cb && cb();
        }
    };

    var getLastAvailablePage = function(){
        var lastPage = apps[apps.length-1];
        if(lastPage.length < 12){
            return lastPage;
        }else{
            var newPage = [];
            apps.push(newPage);
            store();
            return newPage;
        }
    }

    init();

    return {
        promise : initting.promise,
        apps : function(){
            return apps;
        },
        store : store,
        appsDB : appsDB,
        addNewApp : addNewApp,
        uninstallApp : uninstallApp
    };


}]).factory('Background', ['$rootScope', '$http','Storage', '$q','FileSystem','Image', function($rootScope, $http,Storage,$q, FileSystem, Image){
        var initting = $q.defer(),
            storageKey = 'gt.background',
            background = {},
            backgrounds = [
                {image : './img/wallpapers/bg.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg1.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg6.jpg', isLocalBackground : false},
                {image : './img/wallpapers/lake_unsplash.jpg', isLocalBackground : false},
                {image : './img/wallpapers/Elegant_Background-4.jpg', isLocalBackground : false},
                {image : './img/wallpapers/Elegant_Background-5.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0010.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0015.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0017.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0023.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0034.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0035.jpg', isLocalBackground : false},
                {image : './img/wallpapers/abstract_0036.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg100.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg102.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg103.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg104.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg105.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg106.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg107.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg108.jpg', isLocalBackground : false},
                {image : './img/wallpapers/bg109.jpg', isLocalBackground : false},


            ],
            defaultBackground = backgrounds[0],
            localBackgroundFileName = 'myBackground';

        // intializes the service, fetch the background from localStorage or use default
        var init = function(){
            Storage.get(storageKey, function(items){
                if(items && items[storageKey]){
                    angular.extend(background, items[storageKey]);
                    initting.resolve(background);
                }else{
                    angular.extend(background, defaultBackground);
                    initting.resolve(background);
                }
            });
        };


        // select and store new background selected by user
        var selectBackground = function(newBackground){
            angular.extend(background, newBackground);
            background.timestamp = Date.now();
            store();
        };

        // store background object in the localStorage
        var store = function(cb){
            var obj = {};
            obj[storageKey] = background;
            Storage.set(obj, cb);
        };

        // handle image file uploads
        var uploadNewLocalImage = function(dataURL){
            var uploading = $q.defer();

            Image.getBase64Image(dataURL, {maxWidth:1024}).then(function(newDataURL){
                saveImageToFileSystem(newDataURL,localBackgroundFileName+Date.now()+".png").then(function(url){
                    background.image = url;
                    background.isLocalBackground = true;
                    background.timestamp = Date.now();

                    store(function(){
                        uploading.resolve(url);
                    });
                }, function(e){
                    uploading.reject(e);
                });
            }, function(e){
                uploading.reject(e);
            });


            return uploading.promise;
        };

        // store image (dataURL) in the file system
        var saveImageToFileSystem = function(dataURL,fileName){
            return FileSystem.write(fileName, dataURL);
        };


        init();

        return {
            promise : initting.promise,
            background : background,
            backgrounds : function(){
                return backgrounds;
            },
            selectBackground : selectBackground,
            uploadNewLocalImage : uploadNewLocalImage,
            store : store
        };


}]).factory('Storage', ['$rootScope', function($rootScope){
        var localStorageAbstraction = {
            get : function(key, cb){
                var raw = localStorage.getItem(key);
                setTimeout(function(){
                    try{
                        var output = {};
                        output[key] = JSON.parse(raw);
                        cb && cb(output);
                    }catch(e){
                        console.error('Uncaught error:', e);
                        cb && cb();
                    }
                },0);
            },
            set : function(items, cb){
                var item, stringified;
                setTimeout(function(){
                    try{
                        for (var i in items){
                            item = items[i];
                            stringified = JSON.stringify(item);
                            console.log(i, stringified);
                            localStorage.setItem(i, stringified);
                        }
                        cb && cb(1);
                    }catch(e){
                        console.error('Uncaught error:', e);
                        cb && cb();
                    }
                });
            },
            remove : function(key, cb){
                setTimeout(function(){
                    try{
                        localStorage.removeItem(key);
                        cb && cb(1);
                    }catch(e){
                        console.error('Uncaught error:', e);
                        cb && cb();
                    }
                },0);
            }
        };

    var StorageArea = localStorageAbstraction || chrome.storage.local;
    return {
        get : function(keys, cb){
            StorageArea.get(keys, function(items){
                $rootScope.$apply(function(){
                    cb && cb(items);
                })
            });
        },

        set : function(items, cb){
            StorageArea.set(items, function(){
                $rootScope.$apply(function(){
                    cb && cb();
                });
            });
        },

        remove : function (keys, cb){
            StorageArea.remove(keys, function(){
                $rootScope.$apply(function(){
                    cb && cb();
                });
            });
        }
    }
}]).factory('FileSystem', ['$rootScope', '$log','$q', function filesStorageService_Main($rootScope, $log, $q) {
        //vars
        var fs = null,
            fsReady = false,
            initting = $q.defer();

        //file system error handler
        var errorHandler = function(defer){
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

                defer && defer.reject(msg);
                $log.info('Filesystem error: ' + msg);
            }
        };

        //file system open listener
        var onInitFs = function filesStorageService_onInitFs(fileSystem) {
            $rootScope.$apply(function () {
                fs = fileSystem;
                fsReady = true;
                initting.resolve();
                $log.info('Opened file system: ' + fs.name);
            });
        };

        //init window file system api
        var init = function filesStorageService_init() {
            try {
                //support change in file system api prefix
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                var fileSystemSize = 10 * 1024 * 1024, // in byts =10 megabits
                    apiType = window.PERSISTENT,  // or window.TEMPORARY

                //TODO need more research as to what type is better for us to store
                    storageType = {
                        persistent: 'webkitPersistentStorage',
                        temporary: 'temporaryStorage'
                    };

                /**
                 * New Version
                 */
                navigator[storageType.persistent].requestQuota(fileSystemSize, function filesStorageService_init_requestQuota(grantedBytes) {
                    window.requestFileSystem(apiType, grantedBytes, onInitFs, errorHandler(initting));
                }, function fileStorageService_init_requestQuota_error (e) {
                    $log.info('Error init file system api', e);
                });

            } catch (e) {
                $log.info('Error init file system api, caught an error : ', e);
            }

        };
        init();

        var write = function filesStorageService_write(fileName, content, type) {
            var writing = $q.defer();
            try {
                fs.root.getFile(fileName, {create: true}, function filesStorageService_write_getFile(fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function filesStorageService_write_getFile_createWriter(fileWriter) {

                        fileWriter.onwriteend = function filesStorageService_write_getFile_createWriter_onwriteend(e) {
                            $rootScope.$apply(function(){
                                writing.resolve(fileEntry.toURL());
                            });
                            $log.info('Write completed. ', fileEntry.toURL());

                        };

                        fileWriter.onerror = function filesStorageService_write_getFile_createWriter_onerror(e) {
                            $log.info('Write failed: ' + e.toString());
                            writing.reject(e);
                        };

                        //if base 64 image  so extract only the data
                        if(content.indexOf('image/jpeg') > -1){
                            type = "image/jpeg";
                            try{
                                content = content.split('data:image/jpeg;base64,')[1];
                            }catch(e){
                                console.log('Error parsing base 64');
                            }

                        }else if(content.indexOf('image/jpg') > -1){
                            type = "image/jpeg";
                            try{
                                content = content.split('data:image/jpg;base64,')[1];
                            }catch(e){
                                console.log('Error parsing base 64');
                            }

                        }else if(content.indexOf('image/png') > -1){
                            type = "image/png";
                            try{
                                content = content.split('data:image/png;base64,')[1];
                            }catch(e){
                                console.log('Error parsing base 64');
                            }

                        }

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

                    }, errorHandler(writing));

                }, errorHandler(writing));
            } catch (e) {
                writing.reject(e);
                $log.info('Error', e);
            }

            return writing.promise;
        };

        var read = function filesStorageService_read(fileName) {
            var reading = $q.defer();
            try {
                fs.root.getFile(fileName, {}, function filesStorageService_read_getFile(fileEntry) {
                    // Get a File object representing the file,
                    // then use FileReader to read its contents.
                    fileEntry.file(function filesStorageService_read_getFile_file(file) {
                        var reader = new FileReader();

                        reader.onloadend = function filesStorageService_read_getFile_file_onloadend(e) {
                            reading.resolve(this.result);
                        };

                        reader.readAsText(file);
                    }, errorHandler(reading));

                }, errorHandler(reading));
            } catch (e) {
                reading.reject(e);
                $log.info('Error reading file', e);
            }

            return reading.promise;
        };

        var append = function filesStorageService_append(fileName, type, content) {
            var appending = $q.defer();
            try {
                fs.root.getFile(fileName, {create: false}, function (fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function (fileWriter) {

                        fileWriter.seek(fileWriter.length); // Start write position at EOF.

                        // Create a new Blob and write it to log.txt.
                        var blob = new Blob([content], {type: type});

                        fileWriter.write(blob);
                        appending.resolve(fileEntry.toURL());

                    }, errorHandler(appending));

                }, errorHandler(appending));
            } catch (e) {
                $log.info('Error', e);
            }

            return appending.promise;
        };

        var remove = function filesStorageService_remove(fileName) {
            var removing = $q.defer();

            try {
                fs.root.getFile(fileName, {create: false}, function filesStorageService_remove_getFile(fileEntry) {

                    fileEntry.remove(function filesStorageService_remove_getFile_remove() {
                        $log.info('File removed.');
                        removing.resolve();
                    }, errorHandler(removing));

                }, errorHandler(removing));
            } catch (e) {
                $log.info('Error', e);
            }

            return removing.promise;
        };

        var removeByPath = function filesStorageService_removeByPath(path) {
            var removing = $q.defer();

            if (path) {
                var split = path.split('/');
                if (split.length > 0) {
                    return remove(split[split.length - 1]);
                } else {
                    removing.reject('not a valid path');
                }
            } else {
                removing.reject('not a valid path');
            }

            return removing.promise;
        };

        var getFileUrlByFileName = function filesStorageService_getFileUrlByFileName(fileName) {
            var getting = $q.defer();

            var createObject = { create: false};
            return fs.root.getFile(fileName, createObject, function filesStorageService_getFileUrlByFileName_getFile(fileEntry) {
                var url;
                if (fileEntry) {
                    url = fileEntry.toURL();
                }
                getting.resolve(url);
            }, function filesStorageService_getFileUrlByFileName_second_param(e) {
                getting.reject(e);
                errorHandler(e);
            });

            return getting.promise;
        };

        return  {
            promise : initting.promise,
            write: write,
            read: read,
            append: append,
            remove: remove,
            removeByPath: removeByPath,
            getFileUrlByFileName: getFileUrlByFileName
        };
}]).factory('Image', ['$q','$rootScope', function($q,$rootScope){
        var getBase64Image = function imageService_getBase64Image (url,options) {

            options = angular.extend({
                maxWidth : 0,
                maxHeight : 0,
                fixedSize : 0
            }, options);

            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                canvasCopy = document.createElement("canvas"),
                ctxCopy = canvasCopy.getContext("2d"),
                defer = $q.defer();

            // Create original image
            var img = new Image();
            img.src = url;
            img.onload = function imageService_getBase64Image_onload (){
                // Draw original image in second canvas
                try{
                    canvasCopy.width = img.width;
                    canvasCopy.height = img.height;
                    ctxCopy.drawImage(img, 0, 0);

                    //check if resize is not needed
                    if(!options.maxWidth&&!options.maxHeight&&!options.fixedHeight&&!options.fixedWidth){
                        return defer.resolve(canvasCopy.toDataURL());
                    }

                    if(options.fixedSize){
                        canvas.width = options.fixedSize.width || img.width;
                        canvas.width = options.fixedSize.height || img.height;
                    }else{
                        if(!options.maxWidth) options.maxWidth = img.width;
                        if(!options.maxHeight) options.maxHeight = img.height;

                        // Determine new ratio based on max size
                        var ratio = 1;
                        if(img.width > options.maxWidth)
                            ratio = options.maxWidth / img.width;
                        else if(img.height > options.maxHeight)
                            ratio = options.maxHeight / img.height;

                        // Copy and resize second canvas to first canvas
                        canvas.width = img.width * ratio;
                        canvas.height = img.height * ratio;
                    }

                    ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
                    $rootScope.$apply(function(){
                        defer.resolve(canvas.toDataURL());
                    });


                }catch(e){
                    $rootScope.$apply(function(){
                        defer.reject(e);
                    });
                }
            }

            return defer.promise;
        };

        // save url or base64 string to the file system and returns the local url in the call back
        var urlToFile= function imageService_urlToFile (url, params, done){
            var fileName, urlForFileName, typeForFileName;
            params = params || {};
            getBase64Image(url,params.width,params.height,function imageService_urlToFile_getBase64Image (base64,err){
                if(err){
                    (done||angular.noop)(null);
                }else{
                    var type='image/jpeg';
                    if(base64.indexOf("data:image/jpeg;base64,")===0){
                        base64=  base64.split("data:image/jpeg;base64,")[1];
                    }else if(base64.indexOf("data:image/png;base64,")===0){
                        base64=  base64.split("data:image/png;base64,")[1];
                        type='image/png';
                    }

                    typeForFileName = type.split('/')[1];
                    urlForFileName = params.url || url.slice(0,500);
                    fileName = generateFileNameByUrl(params.prefix, urlForFileName, typeForFileName);
                    //generate unique name to each thumbnail
                    filesStorage.write(fileName,type,base64,function imageService_urlToFile_getBase64Image_write (file){
                        (done||angular.noop)(file);
                    });
                }
            });
        };


        // generate filename before saving in the filesystem, using a simple hash function to run on the url. The url is either the url of the image or the url of the page being captured
        var generateFileNameByUrl = function (prefix,url,type) {
            if(!url ) { return null; }
            type = type || options.defaultImageType;
            return (prefix || "") + url.hashCode() + "." +type;
        };

        return {
            getBase64Image : getBase64Image,
            urlToFile : urlToFile
        }
}]).factory('Chrome', [function(){
    return {
        management : {
            getAll : function(cb){
                if(chrome && chrome.management && chrome.management.getAll){
                    return chrome.management.getAll.apply(arguments);
                }else{
                    setTimeout(function(){
                        cb && cb();
                    },0);
                }
            }
        }

    }
}]);
