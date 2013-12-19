"use strict";

define(['env', 'Runtime', 'Renderer', 'SearchRenderer', 'MenuRenderer', 'DialsRenderer', 'Search'], function Main(env, Runtime, Renderer, SearchRenderer, MenuRenderer, DialsRenderer, Search) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Main");
    //Make sure `input` has been rendered with the timeout, then make it focused
    SearchRenderer.promise.then(SearchRenderer.focusOnSearch);

}, window.rErrReport);

//Helper functions
window.log = function log() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i],
            obj;
        if (typeof arg === 'object')
            obj = JSON.stringify(arg, null, 2);
        else
            obj = arg;

        console.log("LOG " + i + "#:" + obj)
    };
};
Array.prototype.last = function() {
    return this.length && this[this.length - 1];
};
window.rErrReport = function requireJSErrorReport(err) {
    log(err);
};
