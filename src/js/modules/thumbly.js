define(function Thumbly(fs) {
    var self = {};
    self.baseUrl = "http://thumbly.herokuapp.com/thumb/download?url=";
    self.fs = fs;
    self.
    default = {
        retries: 3,
        timeout: 1000 * 5
    };
    self.retries = 2;
    self.timeout = 1000 * 5;

    /**
     * get screenshot file from server
     * @param url
     * @param params
     * @param params.retries
     * @param params.timeout
     * @param retry
     * @param done
     * @returns {*|Function}
     */
    self.get = function(url, params, retry, done) {
        params = $.extend(self.timeout, params);
        retry = retry || 0;

        if (!url) return done('[get] - no url supplied');

        if (retry >= params.retries) {
            return (done || common.noop)('no more retires');
        } else {
            self.request(url, function(err, thumblyUrl) {
                if (err || !thumblyUrl) {
                    return self.get(url, params, ++retry, done);
                } else {
                    return (done || common.noop)(null, thumblyUrl);
                }
            });
        }
    };

    /**
     *
     * @param url
     * @param done
     * @returns {*}
     */
    self.getLocalImage = function(url, done) {
        if (!url) return done('[getLocalImage] - no url supplied');
        var fileName = self.filename(url);
        self.fs.getLocalUrl(fileName, function(err, localUrl) {
            if (localUrl) {
                done(null, localUrl);
            } else {
                self.saveUrlToFileSystem(url, done);
            }
        });
    };

    /**
     * get the thumbnail from server and save it locally
     * @param url
     * @param done
     * @returns {*|Function}
     */
    self.request = function(url, done) {
        $.getJSON(self.baseUrl + encodeURIComponent(url) + '&size=l', function(response) {
            if (response && response.url) {
                return (done || common.noop)(null, response.url);
            } else {
                return (done || common.noop)(null, null);
            }
        }, function(err) {
            err = err | 1;
            return (done || common.noop)(err);
        })
    };

    /**
     * generates filename by url so we can save it locally
     * @param url
     * @returns {*}
     */
    self.filename = function(url) {
        if (!url) return false;
        return 'thumb_' + hex_md5(url) + '.png';
    };

    /**
     *
     * @param url
     * @param done
     * @returns {*|Function}
     */
    self.saveUrlToFileSystem = function(url, done) {
        if (!url) return (done || common.noop)('no url');
        self.get(url, null, null, function(err, result) {
            if (err) return (done || common.noop)(err);

            self.urlToImage(result, function(err, base64) {

                if (err) return (done || common.noop)(err);
                var filename = self.filename(url);
                var type = 'image/jpeg';
                if (base64.indexOf("data:image/jpeg;base64,") === 0) {
                    base64 = base64.split("data:image/jpeg;base64,")[1];
                } else if (base64.indexOf("data:image/png;base64,") === 0) {
                    base64 = base64.split("data:image/png;base64,")[1];
                    type = 'image/png';
                }

                self.fs.write(filename, type, base64, function(err, localURL) {
                    if (err) return (done || common.noop)(err);
                    return (done || common.noop)(null, localURL);
                });
            });
        })
    };

    /**
     *
     * @param url
     * @param done
     */
    self.urlToImage = function(url, done) {
        var img = new Image();
        img.src = url;
        img.onload = function() {

            var canvas = document.createElement("canvas");
            canvas.width = self.width;
            canvas.height = self.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(self, 0, 0);

            var base64Data = canvas.toDataURL("image/png");

            done(null, base64Data);
        };

        img.onerror = function() {
            done('error loading image');
        };
    };

    return self;
});
