
(function initDEBUGOptions () {
    DEBUG = {
        logLoadOrder                  : false,
        exposeModules                 : false,
        forceRefreshRuntimeData       : false,
        forceRefreshConfigData        : false,
        JSONProviderForceLoadFromJSON : false,
        wipeLocalStorageOnStart       : false,
        logSearchAlgorithm            : false,
    };

    //Debug Helper functions
    DEBUG.log = function log() {
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i],
                obj;
            if (typeof arg === 'object')
                obj = JSON.stringify(arg, null, 2);
            else
                obj = arg;

            console.log("LOG " + i + "#:" + obj);
        }
    };

})();