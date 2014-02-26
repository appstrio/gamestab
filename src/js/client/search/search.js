/* global _,async */
angular.module('aio.search').directive('aioSearchBox', [
    'Analytics', 'Constants', 'Config', 'bingSearchSuggestions', 'suggestionsData', 'webAppsSuggestions',
    function (Analytics, C, Config, bingSearchSuggestions, suggestionsData, webAppsSuggestions) {
        return function (scope, element) {
            var throttleLimit = C.CONFIG.search_throttle_limit,
                conf,
                searchURL,
                getResults,
                suggestionsURL,
                $container = $('#container'),
                $hiddenInput = $('.hidden').eq(0);

            // each provider should have getSuggestions(q) method that returns a promise
            var suggestionsProviders = [{
                providerObject: webAppsSuggestions,
                priority: 0,
                maxSuggestions: 3
            }, {
                providerObject: bingSearchSuggestions,
                priority: 1,
                maxSuggestions: 3,
                autoShowSuggestionsBox: true
            }];

            Config.isReady.then(function () {
                conf = Config.get();
                searchURL = conf.search_url;
                suggestionsURL = conf.suggestions_url || conf.suggestions_url;
                throttleLimit = conf.search_throttle_limit;
                // initializes the bing search suggestions
                bingSearchSuggestions.init(suggestionsURL);
                assignGetResults();
            });

            /**
             * shows the suggestions box
             */
            var showSuggestionsBox = function () {
                $container.addClass('suggestions-on');
            };

            /**
             * hide the suggestions box
             */
            var hideSuggestionsBox = function () {
                $container.removeClass('suggestions-on');
            };

            // watches whether the suggestion box was emptied
            scope.$watch('searchQuery', function (newVal) {
                if (!newVal) {
                    hideSuggestionsBox();
                }
            });

            var autoSelectFirst = function () {
                //scope.currentSuggestion = -1;
            };

            var assignGetResults = function () {
                // get the results using a throttled function
                getResults = _.throttle(function (val) {
                    suggestionsData.data = [];
                    scope.currentSuggestion = -1;

                    async.each(suggestionsProviders, function (provider, cb) {
                        var pushMethod = (provider.priority > 0) ? 'unshift' : 'push';
                        provider.providerObject.getSuggestions(val).then(function (suggestionsResponse) {
                            if (!suggestionsResponse || !suggestionsResponse.length) {
                                return cb();
                            }

                            for (var i = 0; i < provider.maxSuggestions && i < suggestionsResponse.length; ++i) {
                                suggestionsData.data[pushMethod](suggestionsResponse[i]);
                            }

                            if (provider.autoShowSuggestionsBox) {
                                showSuggestionsBox();
                                autoSelectFirst();
                            }
                            return cb();
                        });
                    });

                }, throttleLimit);
            };

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

                switch (e.keyCode) {
                case 40: //down key
                    e.preventDefault();
                    e.stopPropagation();
                    if (scope.currentSuggestion < suggestionsData.data.length - 1) {
                        scope.$apply(function () {
                            ++scope.currentSuggestion;
                        });
                    }

                    break;
                case 38: //up key
                    e.preventDefault();
                    e.stopPropagation();
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
]).factory('bingSearchSuggestions', ['$http', 'Constants', 'Config', 'Chrome', '$q',
    function ($http, C, Config, Chrome, $q) {
        /**
         * Bing Suggestions Provider
         */
        var baseURL;

        /**
         *
         * @param _baseURL
         */
        var init = function (_baseURL) {
            baseURL = _baseURL;
        };

        /**
         *
         * @param q
         * @returns {*}
         */
        var bingURLBuilder = function (params, q) {
            params = angular.extend({
                jsonp: false
            }, params);

            if (params.jsonp) {
                return baseURL + q + '&JsonType=callback&JsonCallback=JSON_CALLBACK';
            } else {
                return baseURL + q;
            }
        };

        var isIframe = (function (window) {
            var test;
            try {
                test = window.top !== window.self;
            } catch (e) {
                test = false;
            }
            return test;
        }(window));

        /**
         * if chrome extension - use regular GET call
         * if website - use jsnop
         */
        var getSuggestions = function (q) {
            var urlBuildParams = {}, httpMethod = 'get';
            if (baseURL) {
                if (!Chrome.isChrome() || isIframe) {
                    urlBuildParams.jsonp = true;
                    httpMethod = 'jsonp';
                }

                var url = bingURLBuilder(urlBuildParams, q);

                return $http[httpMethod](url).then(function (response) {
                    if (response && response.data && response.data.length && response.data[1]) {
                        return _.map(response.data[1], wrapSuggestion);
                    } else {
                        return [];
                    }
                }, function (e) {
                    console.log('e', e);
                    return false;
                });
            }

            var defer = $q.defer;
            defer.reject();
            return defer.promise;
        };

        // wrap a suggestion so it will conform the structure of the suggestion object
        var wrapSuggestion = function (suggestion) {
            return {
                title: suggestion,
                description: 'Search'
            };
        };

        return {
            init: init,
            getSuggestions: getSuggestions
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
