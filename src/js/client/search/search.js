/* global _,async */
angular.module('aio.search').directive('aioSearchBox', [
    'Analytics', 'Constants', 'Config', 'suggestionsData', 'webAppsSuggestions', '$rootScope', 'bConnect',
    function (Analytics, C, Config, suggestionsData, webAppsSuggestions, $rootScope, bConnect) {
        return function (scope, element) {
            var throttleLimit = C.CONFIG.search_throttle_limit,
                conf,
                searchURL,
                getResults,
                suggestionsURL,
                $container = $('#container'),
                $hiddenInput = $('.hidden').eq(0);

            /*
             * // each provider should have getSuggestions(q) method that returns a promise
             * var suggestionsProviders = [{
             *     providerObject: webAppsSuggestions,
             *     priority: 0,
             *     maxSuggestions: 3
             * }, {
             *     providerObject: bingSearchSuggestions,
             *     priority: 1,
             *     maxSuggestions: 3,
             *     autoShowSuggestionsBox: true
             * }];
             */

            var bConnection = new bConnect.BackgroundApi('suggestions');

            bConnection.defineHandler(function (msg) {
                if (msg.searchResults) {
                    $rootScope.$apply(function () {
                        suggestionsData.data = msg.searchResults;
                    });
                    showSuggestionsBox();
                }
            });

            Config.isReady.then(function () {
                conf = Config.get();
                searchURL = conf.search_url;
                suggestionsURL = conf.suggestions_url || conf.suggestions_url;
                throttleLimit = conf.search_throttle_limit;
                // initializes the bing search suggestions
                var postObj = {
                    type: 'init',
                    params: {
                        suggestionsURL: suggestionsURL
                    }
                };
                bConnection.postMessage(postObj);
            });

            // * shows the suggestions box
            var showSuggestionsBox = function () {
                $container.addClass('suggestions-on');
            };

            // * hide the suggestions box
            var hideSuggestionsBox = function () {
                $container.removeClass('suggestions-on');
            };

            // watches whether the suggestion box was emptied
            scope.$watch('searchQuery', function (newVal) {
                if (!newVal) {
                    hideSuggestionsBox();
                }
            });

            // get the results using a throttled function
            getResults = _.throttle(function (val) {
                suggestionsData.data = [];
                scope.currentSuggestion = -1;

                var postObj = {
                    type: 'get',
                    searchVal: val,
                    howMany: 5
                };

                bConnection.postMessage(postObj);
            }, throttleLimit);

            // When user click enter on the visible/hidden input boxes OR clicks on suggestion
            var executeEnterKeyPress = function (val, suggestion) {
                if (!val) {
                    if (!suggestion) {
                        suggestion = suggestionsData.data[scope.currentSuggestion];
                    }
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
                    window.location = appSuggestion.url;
                });
            };

            // Execute Search
            var executeSearch = function (val) {
                Analytics.reportEvent(301, {
                    label: val,
                    waitForFinish: true
                }).then(function () {
                    window.location = searchURL + val;
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
                        hideSuggestionsBox();
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
                    if (scope.currentSuggestion === 0) {
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
]).factory('searchSuggestions', [

    function () {

        return {

        };
    }
]).factory('webAppsSuggestions', ['Apps', '$filter', '$q',
    function (Apps, $filter, $q) {
        var webAppsDB;

        /**
         *  get the web apps db either from memory or from the apps service
         */
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

        var getSuggestions = function (q) {
            return getWebAppsDb().then(function () {
                var filteredApps = $filter('filter')(webAppsDB, q);
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
