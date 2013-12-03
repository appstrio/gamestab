
common = {
    noop : function COMMON_noop(){
        return;
    },

    binarySearch : function COMMON_binarySearch(needle, arr) {
        if (typeof(arr) === 'undefined' || !arr.length) return -1;

        var high = arr.length - 1;
        var low = 0;
        var vals = [];
        var bUp = true;
        var bDown = true;
        var i = 1;
        var result = [];

        while (low <= high) {
            var mid = parseInt((low + high) / 2);
            var element = arr[mid];
            if (element > needle) {
                high = mid - 1;
            } else if (element < needle) {
                low = mid + 1;
            } else {
                return arr[mid];
            }
        }

        return -1;
    },

    binarySearchForHostName : function COMMON_binarySearch(needle, arr) {
        if (typeof(arr) === 'undefined' || !arr.length) return -1;

        var high = arr.length - 1;
        var low = 0;
        var vals = [];
        var bUp = true;
        var bDown = true;
        var i = 1;
        var result = [];

        while (low <= high) {
            var mid = parseInt((low + high) / 2);
            var element = arr[mid].hostname;
            if (element > needle) {
                high = mid - 1;
            } else if (element < needle) {
                low = mid + 1;
            } else {
                return arr[mid];
            }
        }

        return -1;
    },
    stripWWW : function COMMON_stripWWW (url){
        var host = this.parseUri(url).host;
        return host.replace(/^www./g, "");
    },

    isSubdomain : function COMMON_isSubdomain (url) {
    url = url || 'http://www.test-domain.com'; // just for the example
    var regex = new RegExp(/^([a-z]+\:\/{2})?([\w-]+\.[\w-]+\.\w+)$/);

    return url.match(regex) ? true : false;
    },

    guid : function COMMON_guid(){
        return (function b(
            a                  // placeholder
            ){
            return a           // if the placeholder was passed, return
                ? (              // a random number from 0 to 15
                a ^            // unless b is 8,
                    Math.random()  // in which case
                        * 16           // a random number from
                        >> a/4         // 8 to 11
                ).toString(16) // in hexadecimal
                : (              // or otherwise a concatenated string:
                [1e7] +        // 10000000 +
                    -1e3 +         // -1000 +
                    -4e3 +         // -4000 +
                    -8e3 +         // -80000000 +
                    -1e11          // -100000000000,
                ).replace(     // replacing
                /[018]/g,    // zeroes, ones, and eights with
                b            // random hex digits
            )
        })();
    },


    getAverageRGB : function COMMON_getAverageRGB (imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

    },

    getMainColor : function COMMON_getMainColor (imgEl) {
        var colorsObj                = {},
            colorsArr                = [],
            maxRGBMultiple           = 13481272,
            defaultRGB               = {r:0,g:0,b:0}, // for non-supporting envs
            canvas                   = document.createElement('canvas'),
            context                  = canvas.getContext && canvas.getContext('2d'),
            data,
            width,
            height,
            i                        = -4,
            length,
            blockSize                = 1,
            rgb                      = {r:0,g:0,b:0},
            count                    = 0;

        if (!context) {
            return defaultRGB;
        }

        height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
        width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

        context.drawImage(imgEl, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
        } catch(e) {
            /* security error, img on diff domain */
            return defaultRGB;
        }

        length = data.data.length;

        while ( (i += blockSize * 4) < length ) {
            if(data.data[i+3] < 1)continue;
            var red = data.data[i];
            var green = data.data[i+1];
            var blue = data.data[i+2];
            var multiple = red*green*blue;
            if ( multiple >  maxRGBMultiple){
                continue;
            }
            var hex = tinycolor({r : red, g : green, b: blue}).toHexString();
            colorsObj[hex] = (colorsObj[hex]) ? (colorsObj[hex]+1) : 1;
        }


        for (var i in colorsObj){
            colorsArr.push([i,colorsObj[i]]);
        }

        colorsArr.sort(function(a,b){
            return b[1] - a[1];
        });

        return colorsArr[0][0];

    },

    getMinimalIndex : function COMMON_getMinimalIndex (arr){
        if(!arr || !arr.length)return false;
        var result,min;
        for(var i=0;i<arr.length;i++){
            if(!min) min =arr[i];
            if(arr[i] < min){
                min=arr[i];
                result=i;
            }
        }
        return result;
    },
    isUrl : function COMMON_isUrl (url){
        return (url.indexOf('http://') == 0 || url.indexOf('https://') == 0 || url.indexOf('www.') == 0);
    }

};

Array.prototype.remove = function ARRAY_remove() {
    var what, a = arguments, L = arguments.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Array.prototype.replaceWithArray = function ARRAY_replaceWithArray(newArr) {
    if (!newArr || !newArr.length) return false;
    this.splice(0,this.length);
    for(var i=0;i<newArr.length;++i){
        this.push(newArr[i]);
    }
    return this;
};


Array.prototype.last = function ARRAY_last(){
    return this.length ? this[this.length-1] : null;
};

String.prototype.hashCode = function String_hashCode(){
    var hash = 0, i, l, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

