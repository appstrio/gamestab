/* global _*/
angular.module('aio.search').directive('aioSearchBox', [
    'Analytics', 'Constants', 'Config', 'suggestionsData', 'webAppsSuggestions', '$q', 'bingSearchSuggestions',
    function (Analytics, C, Config, suggestionsData, webAppsSuggestions, $q, bingSearchSuggestions) {
        return function (scope, element) {
            var throttleLimit, conf, searchURL, lastSearch, getResults, suggestionsURL,
                $container = $('#container'),
                $hiddenInput = $('.hidden').eq(0);

            var addResults = function (results, method) {
                //push is default. unshift to place items in beginning
                method = method || 'push';
                if (results && results.length) {
                    clearOldSuggestions(results[0].origin);
                    _.each(results, function (item) {
                        suggestionsData.data[method](item);
                    });
                    scope.setSuggestionsVisibility(true);
                }
            };

            var clearOldSuggestions = function (origin) {
                suggestionsData.data = _.reject(suggestionsData.data, function (item) {
                    return item.origin === origin;
                });
            };

            var getBingSuggestions = function (val, howMany) {
                bingSearchSuggestions.getSuggestions(val, howMany).then(function (data) {
                    addResults(data, 'unshift');
                });
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

                bingSearchSuggestions.init(suggestionsURL);

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
            scope.setSuggestionsVisibility = function (status) {
                $container.toggleClass('suggestions-on', status);
            };

            // watches whether the suggestion box was emptied
            scope.$watch('searchQuery', function (newVal) {
                if (!newVal) {
                    scope.setSuggestionsVisibility(false);
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

            var getExitUrl = function (val) {
                //taken from http://www.faramawi.com/2008/02/best-ever-urll-validation-regulae.html
                var testUrl = /^(https?:\/\/)?(([\w!~*'().&=+$%-]+:)?[\w!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([\w!~*'()-]+\.)*([\w^-][\w-]{0,61})?[\w]\.[a-z]{2,6})(:[0-9]{1,4})?((\/*)|(\/+[\w!~*'().;?:@&=+$,%#-]+)+\/*)$/; /* jshint ignore:line */
                //what url to exit with
                var exitUrl;
                //test if it's a url and if so - exit with it
                if (testUrl.test(val) || /^(https?:\/\/)?localhost(:\d+)?$/.test(val)) {
                    console.log('here');
                    if (!/^https?/.test(val)) {
                        exitUrl = 'http://' + val;
                    } else {
                        exitUrl = val;
                    }
                } else if (/(^chrome:)|(^file:)/.test(val)) {
                    //can't open in same menu otherwise:
                    //"Not allowed to load local resource: chrome://extensions/"
                    //current - send user to search
                    //TODO - find a solution for this.
                    exitUrl = searchURL + val;
                } else {
                    exitUrl = searchURL + val;
                }
                return exitUrl;
            };

            // Execute Search
            var executeSearch = function (val) {
                Analytics.reportEvent(301, {
                    label: val,
                    waitForFinish: true
                }).then(function () {
                    var exitUrl = getExitUrl(val);
                    window.parent.location.href = exitUrl;
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
                        scope.setSuggestionsVisibility(false);
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
            console.log('Filename: search.js', 'Line: 254', '_baseURL:', _baseURL);
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

        /**
         * if chrome extension - use regular GET call
         * if website - use jsnop
         */
        var getSuggestions = function (q, howMany) {
            var urlBuildParams = {}, httpMethod = 'get';
            if (baseURL) {
                urlBuildParams.jsonp = true;
                httpMethod = 'jsonp';

                var url = bingURLBuilder(urlBuildParams, q);
                return $http[httpMethod](url).then(function (response) {
                    if (response && response.data && response.data.length && response.data[1]) {
                        var results = _.first(response.data[1], howMany || 5);
                        return _.map(results, wrapSuggestion);
                    } else {
                        return [];
                    }
                }, function (e) {
                    console.log('e', e);
                    return false;
                });
            }

            return $q.when([]);
        };

        // wrap a suggestion so it will conform the structure of the suggestion object
        var wrapSuggestion = function (suggestion) {
            return {
                title: suggestion,
                origin: 'bing',
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
            app.origin = 'webApps';
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
        return function (scope, element) {
            //if element click then it's outside of suggestions
            element.on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                scope.setSuggestionsVisibility(false);
            });
            scope.suggestions = suggestionsData;
        };
    }
]);
