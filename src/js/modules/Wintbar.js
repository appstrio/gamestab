'use strict';

define(['env', 'jquery', 'when', 'typeahead', 'Runtime', 'Renderer', 'templates'], function Wintbar(env, $, when, typeahead, Runtime, Renderer, Template) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Wintbar");
    var initting = when.defer(),
        self = {
            promise: initting.promise,
        },baseSearchURL, baseSuggestionsURL,runtimeConfig;

    var init = function initModule(runtimeData) {
         runtimeConfig = Runtime.config;
            baseSearchURL = runtimeConfig.base_search_url;
            baseSuggestionsURL = runtimeConfig.base_suggestions_url;

        // self.cc = self.runtimeConfig.location.country.short_name;

        setupUI();

        setEventHandlers();
        setupTypeahead();
        return initting.resolve();
    };

    var setEventHandlers = function() {
        var searchHandler = function searchHandler(e) {
            var query = self.$searchWrapper.find('input').eq(1).val();
            doSearch(query);
        };

        $.fn.onEnterKey = function(callback) {
            return $(this).keyup(function(e) {
                if (e.keyCode == 13) {
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

    var getSuggestions = function(query, process) {
        var url = baseSuggestionsURL + query;

        $.ajax({
            method: "GET",
            url: url,
            success: function(xml) {
                var results = $(xml).find('suggestion'),
                    current, output = [];
                for (var i = 0; i < 3, i < results.length; ++i) {
                    current = results[i];
                    output.push($(current).attr('data'));
                }

                if (output[0] !== query) output.unshift(query);

                process(output);
            },
            dataType: 'xml'
        });
    };

    var doSearch = function(query) {
        if (isURL(query)) {
            redirectToUrl(query);
        } else {
            redirectToSearch(query);
        }
    };

    var isURL = function COMMON_isUrl(url) {
        return (url.indexOf('http://') == 0 || url.indexOf('https://') == 0 || url.indexOf('www.') == 0);
    }

    var redirectToUrl = function(url) {
        if (url.indexOf('http://') !== 0) url = 'http://' + url;

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
