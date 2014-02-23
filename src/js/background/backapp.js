/* global _ */
angular.module('backgroundService', []);

angular.module('backgroundService').factory('searchSuggestions', [
    '$http', 'bingSearchSuggestions',
    function ($http, bingSearchSuggestions) {

        var maxSuggestions = 3;
        var searchResults = [];

        //fixme custom url for now
        bingSearchSuggestions.init('http://api.bing.com/osjson.aspx?Market=en-us&query=');

        // get the results using a throttled function
        var getResults = function (val, howMany) {
            return bingSearchSuggestions.getSuggestions(val, howMany).then(function (response) {
                if (!response || !response.length) {
                    searchResults.length = [];
                    return searchResults;
                }

                howMany = howMany || maxSuggestions;

                searchResults = _.first(response, maxSuggestions);
                return searchResults;
            });
        };

        return {
            getResults: getResults
        };
    }
]);

angular.module('backgroundService').controller('MainCtrl', [
    'searchSuggestions',
    function (searchSuggestions) {

        function suggestionsHandler(port, msg) {
            if (msg.searchVal) {
                searchSuggestions.getResults(msg.searchVal, msg.howMany)
                    .then(function (data) {
                        port.postMessage({
                            searchResults: data
                        });
                    });
            }
        }

        chrome.runtime.onConnect.addListener(function (port) {
            if (port.name === 'suggestions') {
                port.onMessage.addListener(suggestionsHandler.bind(null, port));
            }
        });
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
                //flatten array and then get relevant mapped suggestions
                var wrappedSuggestions = _.flatten(response.data.slice(1, 2)).map(wrapSuggestion);
                return wrappedSuggestions;
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
