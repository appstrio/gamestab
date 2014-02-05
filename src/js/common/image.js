var imageModule = angular.module('aio.image', []);

imageModule.factory('Image', ['$q','$rootScope', function($q,$rootScope){
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
}]);


/**
 * PRIVATE API
 * ...
 ** resize utility...
 * PUBLIC API
 ** urlToBase64  @params(url), @returns(promise(base64_image, resize_options))
 ** urlToLocalFile @params(params --> {url : XXX, filename : XXX, resize_options...}, #returns(promise(localfile_url)
 */