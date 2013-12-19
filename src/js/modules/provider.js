"use strict";

define(['env', 'jquery', 'when', 'Renderer', 'underscore', 'Storage'], function providerBASE(env, $, when, renderer, _, storage) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Provider"); return function newProvider () {
        var self = {
            name: "providerBASE", // Must be overriden in child objects - Used to throw an error if not overriden.
            dials: [],
        };

        self.provide = function(type) {
            return this.fetch();
        };
        self.fetch = function fetchStuff() {
            throw "Must be overriden.";
        }

        self.getDialList = function(name) {
            var def = when.defer(),
                dials = storage.get(name);
            if (dials) def.resolve(dials);
            else def.reject(null);
        };
        self.storeDialList = function(name,dials) {
            var rawDials = _.map(dials, function (dial) {
                return dial.toObject();
            })
            storage.set(name, rawDials);
        };

        self.removeDialFromList = function (dial) {
            return function(e) {
                var removing = when.defer();

                var index = arr.indexOf(dial);
                arr.splice(index,1);

                self.storeDialList();

                return removing.resolve();
            }
        }

        return self;
    };
}, rErrReport);
