"use strict";

define(['env', 'jquery', 'when', 'Renderer', 'underscore', 'Storage'], function providerBASE(env, $, when, renderer, _, storage) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Provider");
    return function newProvider () {
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
        self.setDialList = function(name,dials) {
            var rawDials = _.map(dials, function (dial) {
                return dial.getRaw();
            })
            storage.set(name, rawDials);
        };

        self.errorLoading = function(err) {
            // alert('Error loading, try to refersh or re-install the app.');
            console.log('Error loading, try to refersh or re-install the app.');
        };

        self.removeDialFromList = function (dial) {
            var removing = when.defer(),
                tmpIdentity = dial.identifier(),
                identifierKey = tmpIdentity.key,
                identifierVal = tmpIdentity.val,
                oldDial = _.reject(self.dials, function isThisDial (dial) {
                    return dial[identifierKey] == identifierVal;
                })

            self.setDialList();

            return removing.resolve();
        }

        return self;
    };
}, rErrReport);
