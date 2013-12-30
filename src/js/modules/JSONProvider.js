define(["env", "jquery", "when", "Provider", "Runtime", "Renderer", "Dial", "AndroidDial", "underscore"], function JSONProviderFactory(env, $, when, BaseProvider, runtime, renderer, Dial, AndroidDial, _) {
    "use strict";

    if (window.DEBUG && window.DEBUG.logLoadOrder) {
        console.log("Loading Module : JSONProvider");
    }

    var JSONProvider = function JSONProvider(_name, _pathToJSON, _preLoad) {
        this.name = _name;
        this.pathToJSON = _pathToJSON;

        if (_preLoad) {
            this.init();
        }
    };

    /**
     * @param options {name:string, pathToJSON: string, preLoad:true,forceLoadFromJSON:false,wrapDial:function || rawDials};
     */
    JSONProvider.prototype = BaseProvider();
    JSONProvider.prototype.init = function initJSONProvider(_options) {
        var def;

        this.dials = [];
        $.extend(this.settings, _options);

        //Fetch list of dials
        if (this.settings.forceLoadFromJSON) {
            def = when.reject();
        } else {
            def = this.getDialList(this.name);
        }

        this.promise = def.then(this.resolveAndSave)
            .otherwise(function NoDialsInLocalStorage() {
                //If no dials in localstorage, we need to fetch them and set them there.
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(this.pathToJSON);
                return fetchingJSON.then(this.resolveAndSave);
            });

        return this.promise;
    };

    JSONProvider.prototype.resolveAndSave = function commonFunctionality_resolveAndSave(dials) {
        if (dials) {
            this.storeDialList(this.name, dials, true);
            this.dials = _.map(dials, function(dial) {
                if (dial._type) {
                    if (dial._type === "Dial") {
                        return Dial(dial);
                    } else if (dial._type === "AndroidDial") {
                        return AndroidDial(dial);
                    }
                }
            });
            return when.resolve(this.dials);
        } else {
            return when.reject("NoDials");
        }
    };

    return JSONProvider;
});
