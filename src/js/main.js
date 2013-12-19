"use strict";

define(['env', 'runtime', 'renderer', 'SearchRenderer', 'MenuRenderer', 'DialsRenderer'], function Main(env, Runtime, Renderer, SearchRenderer, MenuRenderer, DialsRenderer) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Main");
    //Make sure `input` has been rendered with the timeout, then make it focused
    var renderInitting = Renderer.init();
    renderInitting.then(function() {
        var SearchRendererInitting = SearchRenderer.init(),
            MenuRendererInitting = MenuRenderer.init(),
            DialsRendererInitting = DialsRenderer.init();

        SearchRendererInitting.then(SearchRenderer.focusOnSearch);
    })
    setTimeout(function boost() {
        // $('.dial-remove-button').eq(0).click();
    }, 0);

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
