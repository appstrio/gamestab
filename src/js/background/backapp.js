/* global _ */
angular.module('backgroundService', []);

angular.module('backgroundService').factory('searchSuggestions', [
    '$http', 'bingSearchSuggestions',
    function ($http, bingSearchSuggestions) {

        var searchResults = [];

        //fixme custom url for now
        bingSearchSuggestions.init('http://api.bing.com/osjson.aspx?Market=en-us&query=');

        // get the results using a throttled function
        var getResults = function (val, howMany) {
            return bingSearchSuggestions.getSuggestions(val, howMany).then(function (response) {
                //got no response back
                if (!response || !response.length) {
                    searchResults.length = [];
                    return searchResults;
                }

                searchResults = response;
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

        var maxSuggestions = 3;
        /**
         * suggestionsHandler
         * Handles communication with main extension about suggestions
         *
         * @param port
         * @param msg
         * @return
         */
        function suggestionsHandler(port, msg) {
            //get suggestions
            if (msg.type === 'get') {
                //has search val
                if (msg.searchVal) {
                    searchSuggestions.getResults(msg.searchVal).then(function (data) {
                        var howMany = msg.howMany || maxSuggestions;
                        var returnResults = _.first(data, howMany);
                        port.postMessage({
                            searchResults: returnResults
                        });
                    });
                }
            }
        }

        /**
         * Wrapper for chrome runtime communications with client
         *
         * @return
         */
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

        //build the url for bing
        var bingURLBuilder = function (q) {
            return baseURL + q;
        };

        var getSuggestions = function (q) {
            var url = bingURLBuilder(q);
            //encode entire search string
            url = encodeURI(url);

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
