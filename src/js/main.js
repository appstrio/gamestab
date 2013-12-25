"use strict";

define(['env', 'Runtime', 'Wintbar', 'Renderer', 'MenuRenderer', 'DialsRenderer'], function Main(env) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : Main");
});

Array.prototype.last = function() {
    return this.length && this[this.length - 1];
};