/**
 *
 * AndroIt Module - Remote installation of AndroidApps
 *
 * Use Cases:
 *   - Checking if user has a playstore account / is logged in -- Use the AndroIt.promise property. .then() will only happen if all previous conditions were met, .otherwise() will be called on any failure.
 *
 * Limitations:
 *   - Can"t install payed apps (POST request returns {ger:11} which I (wie) interpret as a status code of somesort)
 *
 **/
define(function Utils(require) {
    "use strict";

    var when = require("when"),

    lazyload = function lazyload () {
        var def = when.defer(), args = Array.prototype.slice.call(arguments, 0);

        require(args, def.resolve);

        return def.promise;
    };

    return {
        lazyload: lazyload,
        debug: function() { debugger }
    };
});
