'use strict';

define(['env', 'SearchRenderer', 'jquery', 'Runtime', 'when', 'typeahead'], function Search(env, renderer, $, runtime, when, typeahead) {
    if (window.DEBUG && window.DEBUG.logLoadOrder) console.log("Loading Module : Search");
    var initting = when.defer(),
        self = {
            base_search_url: '',
            base_suggestions_url: '',
            promise: initting.promise,
        };

    var init = function initModule() {
        runtime.promise.then(function(runtimeData) {
            var runtimeConfig = runtime.config;
            self.base_search_url = runtimeConfig.base_search_url;
            self.base_suggestions_url = runtimeConfig.base_suggestions_url;

            // self.cc = self.runtimeConfig.location.country.short_name;

            setEventHandlers();
            setupTypeahead();
            return initting.resolve();
        }).catch(initting.reject);
    };

    var setEventHandlers = function() {
        var searchHandler = function searchHandler(e) {
            // First one is twitter typeahead
            var query = renderer.$searchWrapper.find('input').eq(1).val();
            doSearch(query);
        };

        $.fn.onEnterKey = function(callback) {
           return $(this).keyup(function(e) {
                if (e.keyCode == 13) {
                    callback(e);
                }
            });
        }

        renderer.$searchWrapper
            .on('click', '.submit-button', searchHandler)
            .onEnterKey(searchHandler);

    }
    var setupTypeahead = function() {
        var input = renderer.$searchWrapper.find('.search-input').eq(0);
        input.typeahead({
            source: getSuggestions,
            updater: function(item) {
                doSearch(item);
            }
        });
    };

    var getSuggestions = function(query, process) {
        var url = self.base_suggestions_url + query;

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

    var isURL = function COMMON_isUrl (url){
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
                window.location.href = self.base_search_url + query;
            });
        }
        setTimeout(function() {
            window.location.href = self.base_search_url + query;
        }, 500);
    };

    init();

    return self;
});
