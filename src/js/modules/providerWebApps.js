"use strict";

define(['jquery', 'when', 'provider', 'async_runtime', 'renderer', 'env'], function($, when, provider, runtime, renderer, env) {
    return (function(module) {
        var initting = when.defer(),
            self = Object.create(module, {
                name       : "webApps"
                promise    : initting.promise,
                dials      : [],
                settings   : {},
            }),
            defaultSettings = {
                pathToJSON : '/predefinedDials.json'
            },
            rawDials: [], // dials without handlers, hot from the JSONFile oven :) TODO: Better name?
        parent = self.__proto__;

        /**
         * Callback function for self.promise success
         * @param config
         */
        var init = function initModule(options) {
            //Create a settings object by overriding defaultSettings with any custom settings
            self.settings = $.extend(defaultSettings, options);

            //Fetch list of dials
            getDialList();
            //If no dials in localstorage, we need to fetch them and set them there.
            if (!this.dials || this.dials.length == 0) {
                //Get them from a JSON file and put them in storage
                var fetchingJSON = $.getJSON(settings.pathToJSON);
                fetchingJSON.then(function(dialArray) {
                    rawDials = dialArray;

                    prepareDials();

                    self.setDialList();

                }, initting.reject);
            }

            initting.resolve();
        };

        var prepareDials = function prepaireDials() {
            _.each(rawDials, function(dial) {
                self.dials.push($.extend(dial, {
                    remove: self.handlers.remove,
                    click: self.handlers.click,
                    id: '', // So we won't have an undefined in the template's data-id
                }));
            };
        }

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
        async_config.promise.then(init, initting.reject);

        //If init fails handlers
        initting.catch(errorLoading);

        return self;
    })(provider);
}, rErrReport);
