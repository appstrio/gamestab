/* jshint global window,define */
'use strict';

define(['env', 'jquery', 'when', 'typeahead', 'Runtime', 'Renderer', 'templates', 'VimiumUtils'], function Wintbar(env, $, when, typeahead, Runtime, Renderer, Template, VimiumUtils) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : Wintbar");
    var initting = when.defer(),
        self = {
            promise: initting.promise,
        }, baseSearchURL, baseSuggestionsURL, runtimeConfig;

    var init = function initModule(runtimeData) {
        runtimeConfig = Runtime.config;
        baseSearchURL = runtimeConfig.base_search_url;
        baseSuggestionsURL = runtimeConfig.base_suggestions_url;

        // self.cc = self.runtimeConfig.location.country.short_name;

        setupUI();

        setEventHandlers();
        setupTypeahead();

        focusOnSearch();

        return initting.resolve();
    };

    var setEventHandlers = function() {
        var searchHandler = function searchHandler(e) {
            var query = self.$searchWrapper.find('input').eq(1).val();
            doSearch(query);
        };

        $.fn.onEnterKey = function(callback) {
            return $(this).keyup(function(e) {
                if (e.keyCode === 13) {
                    callback(e);
                }
            });
        }

        self.$searchWrapper
            .on('click', '.submit-button', searchHandler)
            .onEnterKey(searchHandler);

    }
    var setupTypeahead = function() {
        var input = self.$searchWrapper.find('.search-input').eq(0);
        input.typeahead({
            source: getSuggestions,
            updater: function(item) {
                doSearch(item);
            }
        });
    };

    var getSuggestions = function(query, callback) {
        var url = baseSuggestionsURL + query,
            gettingSearchSuggestions = $.ajax({
                method: "GET",
                url: url,
                dataType: 'xml',
            }),
            gettingDomainSuggestions = when.defer();

        HistorySuggest(query, gettingDomainSuggestions.resolve)

        when.join(gettingSearchSuggestions, gettingDomainSuggestions.promise).then(function ExtractSearchSuggestionsAndsortSuggestions(values) {
            // Only the top result


            var xml = values[0],
                results = $(xml).find('suggestion'),
                current, output = [];

            for (var i = 0; i < 3, i < results.length; ++i) {
                current = results[i];
                output.push($(current).attr('data'));
            }

            if (query.indexOf("http://") == -1) {
                //fetch domain suggestion
                var historySuggestion = values[1],
                    value = historySuggestion[0],
                    score = historySuggestion[1]

                if (window.DEBUG) console.log(value + " : " + score)

                if (score < 50)
                    output.splice(2, 0, value)
                else
                    output.splice(0, 0, value)
            }

            callback(output);
        }).otherwise(env.errhandler);
    };

    var HistorySuggest = function(query, callback) {
        VimiumUtils.HistoryCache.use(function(history) {
            var url = "hell",
                score = -99,
                byaccesstimeHistory = history.sort(function compareNumbers(a, b) {
                    return a - b;
                });

                _.each(byaccesstimeHistory, function cherryPickFromHistory(item) {
                    if(item.url.indexOf(query) != -1 && item.url.indexOf("file://") === -1 && item.url.indexOf("ftp://") === -1) {
                        var baselessURL = item.url.replace(/https?:\/\/?\.?/, "").replace("www.", ""),
                            wordRelevance = -baselessURL.indexOf(query) * query.length,
                            itemScore = wordRelevance + (query.length * item.visitCount);

                        if (itemScore > score) {
                            console.log("For [" + query + "]:", baselessURL, itemScore, item.visitCount, wordRelevance)
                            score = itemScore
                            url = item.url
                        }
                    }
                });

            callback([url, score])
        });
    }

    var RankSuggestion = function(Suggestion) {

    }

    var doSearch = function(query) {
        if (isURL(query)) {
            redirectToUrl(query);
        } else {
            redirectToSearch(query);
        }
    };

    var isURL = function COMMON_isUrl(url) {
        return (url.indexOf('http://') === 0 || url.indexOf('https://') === 0 || url.indexOf('www.') === 0);
    }

    var redirectToUrl = function(url) {
        if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) url = 'http://' + url;

        if (window.analytics) window.analytics.sendEvent({
            category: 'Search',
            action: 'Url',
            label: url,
            value: 0
        }, function() {
            window.location.href = url;
        });

        setTimeout(function() {
            window.location.href = url;
        }, 500);
    };

    var redirectToSearch = function(query) {
        if (window.analytics) {
            var val = window.analytics.getEventValue(self.cc);

            if (window.analytics) window.analytics.sendEvent({
                category: 'Search',
                action: 'Search',
                label: query,
                value: val
            }, function() {
                window.location.href = baseSearchURL + query;
            });
        }
        setTimeout(function() {
            window.location.href = baseSearchURL + query;
        }, 500);
    };

    var setupUI = function() {
        // widely used dom selectors
        self.$searchWrapper = Renderer.$layout.find('.search-wrapper').eq(0);
        // setup search layout
        self.$searchWrapper.html($(Template['search-wrapper']()));

    }

    var focusOnSearch = function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.update(tab.id, {
                selected: true
            }, function() {
                $('.search-input').blur().focus();
            });
        });
    };

    Runtime.promise.then(init).otherwise(initting.reject);

    return self;
});
