define(['underscore','promise!async_filesystem','jquery','storage'],  function async_screenshot(underscore,fs,$,storage) {
    var self = {}, deferred = new $.Deferred(), key = "screenshots";
    self.storage = storage;
    self.useCaptureQueue = true;
    self.closeWindowTimeoutScript = {
        file: "/js/content_scripts/capture.js",
        runAt: "document_start"
    };
    self.fs = fs;

    self.storeScreenshots = function(done){
        var objToStore = {};
        objToStore[key] = self.screenshots;
        self.storage.set(objToStore, done);
    };

    self.capture = function(params, done){
        var url = params.url;
        var name_prefix = params.name_prefix || 'screenshot';
        var isQueueCall = params.isQueueCall;

        if (self.useCaptureQueue && self.captureIsRunning) {
            self.captureQueueArray = self.captureQueueArray || [];
            arguments[0].isQueueCall = true;
            self.captureQueueArray.push(arguments);
            return;
        }

        self.captureIsRunning = true;
        if (!isQueueCall) {
            self.captureQueueArray = [];
        }

        var settings = {
                left: 999999,
                top: 999999,
                width: 1,
                height: 1,
                type: 'popup',
                focused: false
            },
            currentTab;

        if (!url) {
            return done && done('no url was specified');
        }
        settings.url = url;

        // try to get the local copy of the url
        if(self.screenshots[url]){
            return done && done(null, self.screenshots[url]);
        }else{
            //haven't found local copy of the url, let's capture a screenshoot
            try {
                chrome.tabs.getCurrent(function screenshootService_getCurrent(_tab) {
                    currentTab = params.currentTab || _tab;
                    chrome.windows.create(settings, function screenshootService_getCurrent_create(_window) {
                        chrome.windows.update(_window.id, {
                            top: 9999,
                            left: 9999
                        });
                        //chrome.tabs.update(currentTab.id, {active: true});
                        var contentScriptExecuted;
                        var t = chrome.tabs.onUpdated.addListener(function screenshootService_getCurrent_create_onUpdateCapture(_tabId, _change, _tab) {
                            if(_tab.windowId === _window.id && !contentScriptExecuted){
                                contentScriptExecuted=true;
                                chrome.tabs.executeScript(_tabId, self.closeWindowTimeoutScript, function screenshootService_getCurrent_create_onUpdateCapture_executeScript(a) {
                                });
                            }
                            if (_tab.windowId === _window.id && _change.status && _change.status === 'complete') {
                                chrome.tabs.executeScript(_tabId, self.closeWindowTimeoutScript, function screenshootService_getCurrent_create_onUpdateCapture_executeScript() {
                                });
                                chrome.windows.update(_window.id, {width: 1024, height: 768}, function screenshootService_getCurrent_create_onUpdateCapture_executeScript_update() {
                                    setTimeout(function screenshootService_getCurrent_create_onUpdateCapture_executeScript_update_timeout() {
                                        chrome.tabs.captureVisibleTab(_window.id, {format: 'png'}, function screenshootService_getCurrent_create_onUpdateCapture_executeScript_update_timeout(data) {
                                            //chrome.tabs.update(currentTab.id, {active: true});
                                            chrome.windows.remove(_window.id);
                                            chrome.tabs.onUpdated.removeListener(screenshootService_getCurrent_create_onUpdateCapture);


                                            self.base64ToFile(data, {url: url, prefix: name_prefix, width: 360, height: 250}, function screenshootService_getCurrent_urlToFile(err, _fileUrl) {
                                                data = null;
                                                done && done(null, _fileUrl);
                                                self.captureIsRunning = false;
                                                self.checkCaptureQueue();
                                            }, function screenshootService_getCurrent_urlToFile_done() {
                                                data = null;
                                                done && done(true);
                                                self.captureIsRunning = false;
                                                self.checkCaptureQueue();
                                            });
                                        });
                                    }, 1500);
                                });
                            }
                        });
                    });
                });
            } catch (e) {
                console.error('Error when capture a screenshot', e);
            }
        }
    };


    // save url or base64 string to the file system and returns the local url in the call back
    self.base64ToFile= function imageService_urlToFile (base64, params, done){
        var fileName, urlForFileName, typeForFileName;
        params = params || {};

        var type='image/jpeg';
        if(base64.indexOf("data:image/jpeg;base64,")===0){
            base64=  base64.split("data:image/jpeg;base64,")[1];
        }else if(base64.indexOf("data:image/png;base64,")===0){
            base64=  base64.split("data:image/png;base64,")[1];
            type='image/png';
        }

        typeForFileName = type.split('/')[1];
        urlForFileName = params.url.slice(0,50);
        var url = params.url;
        fileName = self.generateFileNameByUrl(params.prefix, urlForFileName, typeForFileName);
        //generate unique name to each thumbnail
        self.fs.write(fileName,type,base64,function imageService_urlToFile_getBase64Image_write (err, fileUrl){
            self.screenshots[url] = fileUrl;
            self.storeScreenshots();
            done && done(null, fileUrl);
        });
    };
    String.prototype.hashCode = function hashCode () {
        return this + "" + Date.now();
    }

    self.generateFileNameByUrl = function (prefix,url,type) {
        if(!url ) { return null; }
        type = type || options.defaultImageType;
        return (prefix || "") + url.hashCode() + "." +type;
    };



    self.checkCaptureQueue = function screenshootService_checkCaptureQueue() {
        if (_.isArray(self.captureQueueArray)) {
            var args = self.captureQueueArray.shift();
            if (args) self.capture.apply(self, args);
        }
    };

    self.init = (function () {
        self.storage.get(key, function(_screenshots){
            self.screenshots = _screenshots || [];
            deferred.resolve(self);
        });
    })();

    return deferred.promise();
});