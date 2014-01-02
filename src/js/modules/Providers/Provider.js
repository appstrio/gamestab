define(['env', 'jquery', 'when', 'Renderer', 'underscore', 'Storage'], function providerBASE(env, $, when, renderer, _, storage) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : Provider");
    }

    return function newProvider () {
        var self = {
            name: "providerBASE", // Must be overriden in child objects - Used to throw an error if not overriden.
            dials: [],
        };

        self.getDialList = function(name) {
            var dials = storage.get(name);
            if (dials) return when.resolve(dials);
            else return when.reject();
        };
        self.storeDialList = function(name, dials, optionNoWrap) {
            var rawDials;
            if(optionNoWrap) {
                rawDials = dials;
            } else {
                rawDials = _.map(dials, function (dial) {
                    return dial.toObject();
                });
            }
            storage.set(name, rawDials);
        };

        self.removeDialFromList = function (dial) {
            var removing = when.defer();

            var index = this.dials.indexOf(dial);
            this.dials.splice(index,1);

            self.storeDialList(this.name, this.dials);

            return removing.resolve();
        };

        return self;
    };
});
