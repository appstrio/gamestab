angular.module('background').factory('searchSuggestions', [
    'bing',
    function (bing) {
        //stores latest search results
        var searchResults = [];
        //list of valid providers and their respected service
        var providers = {
            bing: bing
        };
        //there can be only one ;-)
        var activeProvider;

        var init = function (params) {
            if (!providers[params.provider]) {
                return console.error('bad provider', params.provider);
            }

            activeProvider = providers[params.provider];
            activeProvider.init(params.suggestionsURL);
        };

        // get the results using a throttled function
        var getResults = function (val, howMany) {
            return activeProvider.getSuggestions(val, howMany).then(function (response) {
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
            init: init,
            getResults: getResults
        };
    }
]);

angular.module('background').factory('bing', ['$http', '$q',
    function ($http, $q) {
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
            if (!baseURL) {
                return $q.when(null);
            }
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
