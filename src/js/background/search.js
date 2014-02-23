angular.module('backgroundService').factory('searchSuggestions', [
    'bingSearchSuggestions',
    function (bingSearchSuggestions) {

        //stores latest search results
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
