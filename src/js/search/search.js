/* global _ */
var searchModule = angular.module('aio.search', []);

searchModule.directive('aioSearchBox', ['Analytics', 'Constants', 'Config', 'bingSearchSuggestions', 'suggestionsData',

    function (Analytics, C, Config, bingSearchSuggestions, suggestionsData) {
        return function (scope, element) {
            var throttleLimit = C.CONFIG.search_throttle_limit,
                config = Config.get(),
                searchURL = Config.search_url || C.CONFIG.search_url,
                suggestionsURL = Config.suggestions_url || C.CONFIG.suggestions_url,
                $container = $('#container');


            bingSearchSuggestions.init(suggestionsURL);

            element.focus();

            var showSuggestionsBox = function(){
                $container.addClass('suggestions-on');
            };

            scope.$watch('searchQuery', function(newVal){
                console.log('newVal',newVal);
               if(!newVal){
                   $container.removeClass('suggestions-on');
               }
            });


            // get the results using a throttled function
            var getResults = _.throttle(function (val) {
                //TODO build a list of recommended search results
                console.debug('typeahead guess', val);

                bingSearchSuggestions.getSuggestions(val).then(function(suggestionsResponse){
                   console.debug('suggestions for ' + val,suggestionsResponse);
                    suggestionsData.data = suggestionsResponse
                    showSuggestionsBox();
                });
            }, throttleLimit);

            //search box is focused
            element.on('focus', function () {
                Analytics.reportEvent(302);
            });

            //keydown is pressed in search box
            element.on('keyup', function (e) {
                var val = element.val();
                if (val) {
                    if (e.keyCode === 13) {
                        Analytics.reportEvent(301, {
                            label: val,
                            waitForFinish: true
                        }).then(function () {
                            window.location = searchURL + val;
                        });
                    } else {
                        getResults(val);
                    }
                }
            });
        };
    }
]).factory('searchSuggestions', [ '$http', 'Constants', function($http, C){

    return {

    }
}]).factory('bingSearchSuggestions', ['$http', 'Constants', 'Config','Chrome', function($http, C, Config, Chrome){

    var baseURL;


    /**
     *
     * @param _baseURL
     */
    var init = function (_baseURL){
        baseURL = _baseURL;
    };


    /**
     *
     * @param q
     * @returns {*}
     */
    var bingURLBuilder = function(params, q){
        params = angular.extend({
            jsonp : false
        }, params);

        if(params.jsonp){
            return baseURL + q + '&JsonType=callback&JsonCallback=JSON_CALLBACK';
        }else{
            return baseURL + q;
        }
    };


    /**
     * if chrome extension - use  JSONP
     * if website - use regular GET call
     */
    var getSuggestions = function(q){
        var urlBuildParams = {}, httpMethod = 'get';
        if(baseURL){
            if(!Chrome.isChrome()){
                urlBuildParams.jsonp = true;
                httpMethod = 'jsonp';
            }else{

            }

            return $http[httpMethod](bingURLBuilder(urlBuildParams, q)).then(function(response){
                return response && response.data && response.data.length && response.data[1];
            });

        }else{
            var defer = $q.defer;
            defer.reject();
            return defer.promise;
        }
    };



    return {
        init : init,
        getSuggestions : getSuggestions
    }
}]).factory('suggestionsData', [function(){
        return {
            data : []
        };
}]).directive('aioSearchSuggestions', ['suggestionsData', function(suggestionsData){
        return function(scope){
            scope.suggestions = suggestionsData;
        }
}]);
