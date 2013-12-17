"use strict";

define(['jquery', 'when', 'provider', 'async_runtime'], function($, when, provider, runtime) {
    return (function(module) {
        var self = Object.create(module);

        self.fetch = function fetchApps() {
            var def = when.defer();
            runtime.promise.then(function(runtime) {
                def.resolve(runtime.data.dials.dials);
            })
            return def.promise;
        }

        return self;
    })(provider);
}, rErrReport);
