/* global _ */
var searchModule = angular.module('aio.search', []);

searchModule.directive('aioSearchBox', ['Analytics', 'Constants', 'Config', 'bingSearchSuggestions', 'suggestionsData', 'webAppsSuggestions',

    function (Analytics, C, Config, bingSearchSuggestions, suggestionsData,webAppsSuggestions) {
        return function (scope, element) {
            var throttleLimit = C.CONFIG.search_throttle_limit,
                config = Config.get(),
                searchURL = Config.search_url || C.CONFIG.search_url,
                suggestionsURL = Config.suggestions_url || C.CONFIG.suggestions_url,
                $container = $('#container'),
                $hiddenInput = $('.hidden').eq(0);

                // each provider should have getSuggestions(q) method that returns a promise
                var suggestionsProviders = [
                    {providerObject : webAppsSuggestions, priority : 0, maxSuggestions : 3},
                    {providerObject : bingSearchSuggestions, priority : 1, maxSuggestions : 3, autoShowSuggestionsBox: true}
                ];

            // initializes the bing search suggestions
            bingSearchSuggestions.init(suggestionsURL);

            element.focus();


            /**
             * shows the suggestions box
             */
            var showSuggestionsBox = function(){
                $container.addClass('suggestions-on');
            };


            /**
             * hide the suggestions box
             */
            var hideSuggestionsBox = function(){
                $container.removeClass('suggestions-on');
            };


            // watches whether the suggestion box was emptied
            scope.$watch('searchQuery', function(newVal){
               if(!newVal){
                   hideSuggestionsBox();
               }
            });


            var autoSelectFirst = function(){
                //scope.currentSuggestion = -1;
            };

            // get the results using a throttled function
            var getResults = _.throttle(function (val) {
                //TODO build a list of recommended search results
                console.debug('typeahead guess', val);

                suggestionsData.data = [];
                scope.currentSuggestion = -1;

                async.each(suggestionsProviders, function(provider, cb){
                    var pushMethod = (provider.priority > 0) ? 'unshift' : 'push' ;
                    provider.providerObject.getSuggestions(val).then(function(suggestionsResponse){
                        for(var i = 0; i < provider.maxSuggestions && i < suggestionsResponse.length; ++i){
                            suggestionsData.data[pushMethod](suggestionsResponse[i]);
                        }
                        if(provider.autoShowSuggestionsBox){
                            showSuggestionsBox();
                            autoSelectFirst();
                        }
                        cb();
                    }, function(){
                        cb();
                    });

                }, function(){

                });

//                bingSearchSuggestions.getSuggestions(val).then(function(suggestionsResponse){
//                    for(var i = 0; i < 3 && i < suggestionsResponse.length; ++i){
//                        suggestionsData.data.unshift(suggestionsResponse[i]);
//                    }
//                    showSuggestionsBox();
//                });
//
//                webAppsSuggestions.getSuggestions(val).then(function(suggestionsResponse){
//                    for(var i = 0; i < 3 && i < suggestionsResponse.length; ++i){
//                        suggestionsData.data.push(suggestionsResponse[i]);
//                    }
//
//                });

            }, throttleLimit);


            // When user click enter on the visible/hidden input boxes OR clicks on suggestion
            var executeEnterKeyPress = function(val, suggestion){
                if(!val){
                    if(!suggestion){
                        suggestion = suggestionsData.data[scope.currentSuggestion];
                    }
                    if(!suggestion) return;
                    if(suggestion.url){
                        return executeAppLaunch(suggestion);
                    }else{
                        val = suggestion.title;
                    }
                }

                return executeSearch(val);
            };


            // Execute App Launch
            var executeAppLaunch = function(appSuggestion){
                Analytics.reportEvent(301, {
                    label: appSuggestion.title,
                    waitForFinish: true
                }).then(function () {
                        window.location = appSuggestion.url;
                });
            };


            // Execute Search
            var executeSearch = function(val){
                Analytics.reportEvent(301, {
                    label: val,
                    waitForFinish: true
                }).then(function () {
                        window.location = searchURL + val;
                });
            };

            // launch search suggestion form mouse click
            scope.launchSuggestionByClick = function(suggestion, e){
                e.preventDefault();
                e.stopPropagation();
                return executeEnterKeyPress(null, suggestion);
            };



            //search box is focused
            element.on('focus', function () {
                Analytics.reportEvent(302);
            });

            //keydown is pressed in search box
            element.on('keyup', function (e) {
                var val = element.val();
                if (val) {
                    switch(e.keyCode){
                        case 13:
                            executeEnterKeyPress(val);
                            break;
                        case 40:
                            // down
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('$hiddenInput',$hiddenInput);
                            $hiddenInput.val("");
                            $hiddenInput.focus();
                            scope.$apply(function(){
                                scope.currentSuggestion = 0;
                            });
                            break
                        case 38:
                            break;
                        default:
                            getResults(val);

                    }
                }
            });

            //keydown is pressed in HIDDEN search box
            $hiddenInput.on('keyup', function (e) {
                if(!suggestionsData.data || !suggestionsData.data.length) return;
                switch(e.keyCode){
                    case 40:
                        // down
                        e.preventDefault();
                        e.stopPropagation();
                        if(scope.currentSuggestion < suggestionsData.data.length-1){
                            scope.$apply(function(){
                                ++scope.currentSuggestion;
                            });
                        }

                        break
                    case 38:
                        // up
                        e.preventDefault();
                        e.stopPropagation();
                        if(scope.currentSuggestion > 0){
                            scope.$apply(function(){
                                --scope.currentSuggestion;
                            });
                        }
                        break
                    case 13:
                        executeEnterKeyPress();
                        break;
                }

            });
        };
    }
]).factory('searchSuggestions', [ '$http', 'Constants', function($http, C){

    return {

    }
}]).factory('bingSearchSuggestions', ['$http', 'Constants', 'Config','Chrome', function($http, C, Config, Chrome){
    /**
     * Bing Suggestions Provider
     */
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
                if(response && response.data && response.data.length && response.data[1]){
                    for(var i = 0;i<response.data[1].length;++i){
                        response.data[1][i] = wrapSuggestion(response.data[1][i]);
                    }
                    return response.data[1]
                }else{
                    return 0;
                }
            });

        }else{
            var defer = $q.defer;
            defer.reject();
            return defer.promise;
        }
    };


    // wrap a suggestion so it will conform the structure of the suggestion object
    var wrapSuggestion = function(suggestion){
        return {title : suggestion, description : "Search"};
    }



    return {
        init : init,
        getSuggestions : getSuggestions
    }
}]).factory('webAppsSuggestions', [ 'Apps', '$filter', '$q', function(Apps, $filter, $q){
    /**
     * Web Apps Suggestions Provider
     */

        var webAppsDB;

    /**
     *  get the web apps db either from memory or from the apps service
     */
    var getWebAppsDb = function(){
        var defer = $q.defer();

        if(webAppsDB){
            defer.resolve(webAppsDB);
        }else{
            Apps.getWebAppsDb().then(function(_webAppsDB){
                webAppsDB = _webAppsDB;
                defer.resolve(webAppsDB);
            });
        }

        return defer.promise;

    };


    var getSuggestions = function(q){
        return getWebAppsDb().then(function(){
            var filteredApps = $filter('filter')(webAppsDB, q);
            for(var i = 0; i < filteredApps.length; ++i){
                filteredApps[i] = wrapSuggestion(filteredApps[i]);
            }
            return filteredApps;
        });
    };

    // wrap a suggestion so it will conform the structure of the suggestion object
    var wrapSuggestion = function(app){
        app.description = app.tags && app.tags[0];
        return app;
    }


    return {
        getSuggestions : getSuggestions
    }
}]).factory('suggestionsData', [function(){
        // service to share the suggestions array between controllers and other services
        return {
            data : []
        };
}]).directive('aioSearchSuggestions', ['suggestionsData', function(suggestionsData){
        return function(scope){
            scope.suggestions = suggestionsData;
        }
}]);
