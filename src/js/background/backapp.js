/* global _ */
angular.module('backgroundService', []);

angular.module('backgroundService').factory('searchSuggestions', [
    '$http', 'bingSearchSuggestions',
    function ($http, bingSearchSuggestions) {

        var throttleLimit = 100;
        var maxSuggestions = 3;
        var searchResults = [];

        //fixme custom url for now
        bingSearchSuggestions.init('http://api.bing.com/osjson.aspx?Market=en-us&query=');

        // get the results using a throttled function
        var getResults = function (val) {
            return bingSearchSuggestions.getSuggestions(val).then(function (response) {
                if (!response || !response.length) {
                    searchResults.length = [];
                    return;
                }

                searchResults = _.first(response, maxSuggestions);
                return searchResults;
            });
        };

        chrome.runtime.onConnect.addListener(function (port) {
            if (port.name === 'suggestions') {
                port.onMessage.addListener(function (msg) {
                    if (msg.searchVal) {
                        getResults(msg.searchVal).then(function (data) {
                            port.postMessage({
                                searchResults: data
                            });
                        });
                    }
                });
            }
        });
        return {
            getResults: getResults
        };
    }
]);

angular.module('backgroundService').controller('MainCtrl', [
    'searchSuggestions',
    function (searchSuggestions) {
        console.debug('Starting MainCtrl');
    }

]);

angular.module('backgroundService').factory('bingSearchSuggestions', ['$http',
    function ($http) {
        /**
         * Bing Suggestions Provider
         */
        var baseURL;

        var init = function (_baseURL) {
            baseURL = _baseURL;
        };

        var bingURLBuilder = function (q) {
            return baseURL + q;
        };

        var getSuggestions = function (q) {
            var url = bingURLBuilder(q);

            return $http.get(url).then(function (response) {
                return _.flatten(response.data.slice(1, 2)).map(wrapSuggestion);
            }, function (e) {
                console.warn('e', e);
                return false;
            });
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
]);
