"use strict";

define(['jquery', 'when', 'provider', 'async_runtime', 'renderer'], function($, when, provider, runtime, renderer) {
    return (function(module) {
        var self = Object.create(module),
            parent = self.__proto__;


        var init = function(){

        };
        $.extend(self, {
            name: ""
        });


        async_runtime.promise.then(init, initError);

        return self;
    })(provider);
}, rErrReport);