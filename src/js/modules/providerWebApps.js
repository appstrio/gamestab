"use strict";

define(['jquery', 'when', 'provider', 'runtime', 'renderer', 'env'], function($, when, provider, runtime, renderer, env) {
    return (function(module) {
        var initting = when.defer(),
            self = Object.create(module),
            defaultSettings = {
                pathToJSON : '/js/predefinedDials.json'
            },
            rawDials = []; // dials without handlers, hot from the JSONFile oven :) TODO: Better name?

        parent = self.__proto__;

        /**
         * Callback function for self.promise success
         * @param options Custom settings to override self.settings
         */
        var init = function initModule(runtimeData, options) { // Passed in from runtime
            //Create a settings object by overriding defaultSettings with any custom settings
            $.extend(self,{
                promise    : initting.promise,
                dials      : [],
                settings   : $.extend(defaultSettings, options),
            });

            //Fetch list of dials
            var listFetching = self.getDialList(); // Into a vaWe don't care about what it returns... for now.
            //If no dials in localstorage, we need to fetch them and set them there.
            if (!self.dials || self.dials.length == 0) {
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(self.settings.pathToJSON);
                fetchingJSON.then(function(dialArray) {
                    rawDials = dialArray;

                    prepareDials();

                    self.setDialList();

                    initting.resolve(self.dials);

                }, initting.reject);
            } else {
                initting.resolve(self.dials);
            }

        };

        var prepareDials = function prepaireDials() {
            _.each(rawDials, function(dial) {
                self.dials.push($.extend(dial, {
                    remove: self.handlers.remove,
                    click: self.handlers.click,
                    id: '', // So we won't have an undefined in the template's data-id
                }));
            });
        };

        // Main provider.js

        self.fetch = function fetchDials () {
            return when.resolve(self.dials);
        }

        // Event Handlers
        // NOTE: all events are triggered by DOM elements

        var setEventHandlers = function () {
            var handlers = {
                remove: remove,
                click: parent.handlers.click,
            };

            self.handlers = handlers;
        }

        var remove = function removeDial (e) {
            var parentHandling = parent.handlers.remove(e),
                removing = when.defer();

            parentHandling.then(function() {
                var $targetDiv = $(e.currentTarget).parents('.dial').eq(0),
                    identifierKey = 'url'
                    identifierVal = $target.find('a').attr('href');

                self.dials = _.reject(self.dials, function removeIfOffendingDial (dial) {
                    return dial[identifierKey] == identifierVal;
                });

                self.setDialList();

                removing.resolve();
            });

            return removing.promise;
        }

        //HELPERS

        /** could be refactored to a center module everybody inherit from (also appears in runtime) **/
        var errorLoading = function(err) {
            // alert('Error loading, try to refersh or re-install the app.');
            console.log('Error loading, try to refersh or re-install the app.');
        };

        //Init after dependencies have loaded;
        runtime.promise.then(init, initting.reject);

        //If init fails handlers
        initting.promise.catch(errorLoading);

        init();

        return self;
    })(provider);
}, rErrReport);
