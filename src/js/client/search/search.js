/* global _*/
angular.module('aio.search').directive('aioSearchBox', [
    'Analytics', 'Constants', 'Config', 'suggestionsData', 'webAppsSuggestions', '$rootScope', 'bConnect', '$q',
    function (Analytics, C, Config, suggestionsData, webAppsSuggestions, $rootScope, bConnect, $q) {
        return function (scope, element) {
            var throttleLimit = C.CONFIG.search_throttle_limit,
                conf, searchURL, lastSearch, getResults, suggestionsURL,
                $container = $('#container'),
                $hiddenInput = $('.hidden').eq(0);

            var bConnection = new bConnect.BackgroundApi('suggestions');

            var addResults = function (results, method) {
                //push is default. unshift to place items in beginning
                method = method || 'push';
                if (results && results.length) {
                    _.each(results, function (item) {
                        suggestionsData.data[method](item);
                    });
                    setSuggestionsVisibility(true);
                }
            };

            bConnection.addListener(function (msg) {
                if (msg && msg.searchResults) {
                    //reverse items because they will be unshifted into array
                    var results = msg.searchResults.reverse();
                    $rootScope.$apply(function () {
                        addResults(results, 'unshift');
                    });

                    setSuggestionsVisibility(true);
                }
            });

            var getBingSuggestions = function (val, howMany) {
                var postObj = {
                    type: 'get',
                    searchVal: val,
                    howMany: howMany
                };

                bConnection.postMessage(postObj);
            };

            //each provider should have getSuggestions(q) method that returns a promise
            var providers = [{
                name: 'webApps',
                get: webAppsSuggestions.getSuggestions,
                handler: addResults,
                priority: 0,
                maxSuggestions: 2
            }, {
                name: 'bing',
                get: getBingSuggestions,
                priority: 1,
                maxSuggestions: 5,
                //is handled in port connection
                handler: angular.noop
            }];

            Config.isReady.then(function () {
                conf = Config.get();
                searchURL = conf.search_url;
                suggestionsURL = conf.suggestions_url || conf.suggestions_url;
                throttleLimit = conf.search_throttle_limit;

                // initializes the bing search suggestions
                var postObj = {
                    type: 'init',
                    params: {
                        provider: conf.suggestions_type || 'bing',
                        suggestionsURL: suggestionsURL
                    }
                };
                bConnection.postMessage(postObj);

                // get the results using a throttled function
                getResults = _.throttle(function (val) {
                    if (!val || val === lastSearch) {
                        return;
                    }
                    lastSearch = val;
                    //clear current results
                    suggestionsData.data.length = 0;
                    //clear selected result
                    scope.currentSuggestion = -1;

                    _.each(providers, function (provider) {
                        $q.when(provider.get(val, provider.maxSuggestions)).then(provider.handler);
                    });
                }, throttleLimit);

            });

            // * hide the suggestions box
            var setSuggestionsVisibility = function (status) {
                if (status) {
                    $container.addClass('suggestions-on');
                } else {
                    $container.removeClass('suggestions-on');
                }
            };

            // watches whether the suggestion box was emptied
            scope.$watch('searchQuery', function (newVal) {
                if (!newVal) {
                    setSuggestionsVisibility(false);
                }
            });

            // When user click enter on the visible/hidden input boxes OR clicks on suggestion
            var executeEnterKeyPress = function (val, suggestion) {
                if (!val) {
                    suggestion = suggestion || suggestionsData.data[scope.currentSuggestion];

                    if (!suggestion) {
                        return;
                    }
                    if (suggestion.url) {
                        return executeAppLaunch(suggestion);
                    } else {
                        val = suggestion.title;
                    }
                }

                return executeSearch(val);
            };

            // Execute App Launch
            var executeAppLaunch = function (appSuggestion) {
                Analytics.reportEvent(301, {
                    label: appSuggestion.title,
                    waitForFinish: true
                }).then(function () {
                    window.parent.location = appSuggestion.url;
                });
            };

            // Execute Search
            var executeSearch = function (val) {
                Analytics.reportEvent(301, {
                    label: val,
                    waitForFinish: true
                }).then(function () {
                    window.parent.location = searchURL + val;
                });
            };

            // launch search suggestion form mouse click
            scope.launchSuggestionByClick = function (suggestion, e) {
                e.preventDefault();
                e.stopPropagation();
                return executeEnterKeyPress(null, suggestion);
            };

            //search box is focused
            element.on('focus', function () {
                Analytics.reportEvent(302);
            });

            //keydown is pressed in search box
            element.on('keyup', function (e, bubbled) {
                var keyCode = e.keyCode || bubbled.keyCode;
                var val = element.val();
                if (val) {
                    switch (keyCode) {
                    case 13: //enter
                        executeEnterKeyPress(val);
                        break;
                    case 27: //esc
                        setSuggestionsVisibility(false);
                        break;
                    case 40:
                        // down
                        e.preventDefault();
                        e.stopPropagation();
                        $hiddenInput.val('');
                        $hiddenInput.focus();
                        scope.$apply(function () {
                            scope.currentSuggestion = 0;
                        });
                        break;
                    case 38: //up arrow
                        break;
                    default:
                        getResults(val);
                    }
                }
            });

            //keydown is pressed in HIDDEN search box
            $hiddenInput.on('keyup', function (e) {
                if (!suggestionsData.data || !suggestionsData.data.length) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                switch (e.keyCode) {
                case 40: //down key
                    if (scope.currentSuggestion < suggestionsData.data.length - 1) {
                        scope.$apply(function () {
                            ++scope.currentSuggestion;
                        });
                    }

                    break;
                case 38: //up key
                    //go back to search element
                    if (scope.currentSuggestion <= 0) {
                        scope.$apply(function () {
                            scope.currentSuggestion = -1;
                        });
                        return element.focus();
                    }

                    //go up in suggestions
                    if (scope.currentSuggestion > 0) {
                        scope.$apply(function () {
                            --scope.currentSuggestion;
                        });
                    }
                    break;
                case 13: //enter
                    executeEnterKeyPress();
                    break;
                default:
                    //bubble up the key
                    element.trigger('keyup', {
                        keyCode: e.keyCode
                    });
                }
            });
        };
    }
]).factory('webAppsSuggestions', ['Apps', '$filter', '$q',
    function (Apps, $filter, $q) {
        var webAppsDB;

        //get the web apps db either from memory or from the apps service
        var getWebAppsDb = function () {
            var defer = $q.defer();

            if (webAppsDB) {
                defer.resolve(webAppsDB);
            } else {
                Apps.getWebAppsDb().then(function (_webAppsDB) {
                    webAppsDB = _webAppsDB;
                    defer.resolve(webAppsDB);
                });
            }
            return defer.promise;
        };

        var getSuggestions = function (q, howMany) {
            return getWebAppsDb().then(function () {
                howMany = howMany || 3;
                var filteredApps = $filter('filter')(webAppsDB, q);
                filteredApps = _.first(filteredApps, howMany);
                return _.map(filteredApps, wrapSuggestion);
            });
        };

        // wrap a suggestion so it will conform the structure of the suggestion object
        var wrapSuggestion = function (app) {
            app.description = app.tags && app.tags[0];
            return app;
        };

        return {
            getSuggestions: getSuggestions
        };
    }
]).factory('suggestionsData',
    function () {
        // service to share the suggestions array between controllers and other services
        return {
            data: []
        };
    }
).directive('aioSearchSuggestions', ['suggestionsData',
    function (suggestionsData) {
        return function (scope) {
            scope.suggestions = suggestionsData;
        };
    }
]);
