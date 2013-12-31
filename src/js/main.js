"use strict";

define(["Runtime", "Wintbar", "Renderer", "MenuRenderer", "DialsRenderer"], function Main() {
    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : Main");
    }
    require(["Analytics"],null);
});

Array.prototype.last = function() {
    return this.length && this[this.length - 1];
};