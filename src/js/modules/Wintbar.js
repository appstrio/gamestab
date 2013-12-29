(function($) {
    "use strict";

    $.fn.attrFromAll = function basicToJSON(attr) {
        var items = [];

        this.each(function iterator() {
            items.push($(this).attr(attr));
        });

        return items;
    };
})(jQuery);

define(["env", "jquery", "when", "typeahead", "Runtime", "Renderer", "templates", "underscore"], function Wintbar(env, $, when, typeahead, Runtime, Renderer, Template, _) {
    "use strict";

    if (window.DEBUG && window.DEBUG.logLoadOrder) {
        console.log("Loading Module : Wintbar");
    }
    var initting = when.defer(),
        self = {
            promise: initting.promise,
            datums: [],
        }, baseSearchUrl, baseSuggestionsURL, runtimeConfig;

    var init = function initModule() {
        runtimeConfig = Runtime.config;
        baseSearchUrl = runtimeConfig.base_search_url;
        baseSuggestionsURL = runtimeConfig.base_suggestions_url;

        // self.cc = self.runtimeConfig.location.country.short_name;

        setupUI();

        setEventHandlers();
        setupTypeahead();

        focusOnSearch();

        return initting.resolve();
    };

    var setEventHandlers = function() {
        var searchHandler = function searchHandler() {
            var query = self.$searchWrapper.find("input").eq(1).val();
            doSearch(query);
        };

        $.fn.onEnterKey = function(callback) {
            return $(this).keyup(function(e) {
                if (e.keyCode === 13) {
                    callback(e);
                }
            });
        };

        self.$searchWrapper
            .on("click", ".submit-button", searchHandler)
            .onEnterKey(searchHandler);

    };
    var setupTypeahead = function() {
        var input = self.$searchWrapper.find(".search-input").eq(0);
        input.typeahead({
            name: "main",
            template: function renderTemplate(datum) {
                var url = typeof datum.url === "undefined" ? "" : datum.url;
                return "<p data-url=\"" + url + "\">" + datum.value + "</p>";
            },
            source: getSuggestions,
            updater: function(item) {
                doSearch(item);
            }
        });
    };

    var fetchRemoteSuggestionsRaw = function(query) {
        var url = baseSuggestionsURL + query;
        // limitResults = 10,
        return $.ajax({
            method: "GET",
            url: url,
            dataType: "xml",
        }).then(function processXML(xml) {
            return $(xml).find("suggestion").attrFromAll("data");
        });
    };

    var fetchRemoteSuggestions = function(query) {
        var fetchingRawData = fetchRemoteSuggestionsRaw(query);

        return fetchingRawData.then(function processRawData(data) {
            return _.map(data, function(rawData) {
                return {
                    value: rawData,
                    // icon: "some url to an icon of remote suggestion here"
                    // tokens: []
                };
            });
        });
    };

    var fetchHistorySuggestions = function(query) {
        var def = when.defer();
        var processHistoryEntries = function processHistoryEntries(historyEntries) {
            var url = "",
                bestEntriesStack = [],
                lastEntryScore = 0,
                domain = "";
            _.each(historyEntries, function transformToTypeaheadDatums(rawDatum) {
                if (rawDatum.url.indexOf("file://") === -1 && rawDatum.url.indexOf("ftp://") === -1) {
                    self.datums.push({
                        url: rawDatum.url,
                        value: rawDatum.url.replace("www.", ""),
                        visitCount: rawDatum.visitCount,
                    });
                    self.datums.push({
                        url: rawDatum.url,
                        value: rawDatum.url.replace(/https?:\/\/?\.?/, ""),
                        visitCount: rawDatum.visitCount,
                    });
                    self.datums.push({
                        url: rawDatum.url,
                        value: rawDatum.url.replace(/https?:\/\/?\.?/, "").replace("www.", ""),
                        visitCount: rawDatum.visitCount,
                    });
                }
            });

            _.each(self.datums, function cherryPickEntriesFromHistory(entry) {
                // Enforce matching only at the start of the domain
                var entryDomain = entry.value;
                if (entryDomain.indexOf(query) === 0) {
                    var entryScore = query.length + entry.visitCount;
                    if (entryScore > lastEntryScore) {
                        if (window.DEBUG && window.DEBUG.logSearchAlgorithm) {
                            console.log("For [" + query + "]:", entry.value, entry.visitCount, entryScore);
                        }
                        lastEntryScore = entryScore;
                        entry.score = entryScore;
                        bestEntriesStack.push(entry);
                    }
                }
            });

            //debugger

            def.resolve(bestEntriesStack.pop());
        };

        chrome.history.search({
            text: "",
            maxResults: 20000,
            startTime: 0
        }, processHistoryEntries);

        return def.promise;
    };

    var getSuggestions = function(query, callback) {
        // var getSuggestions = when.defer();

        when.join(fetchRemoteSuggestions(query), fetchHistorySuggestions(query)).then(function ExtractSearchSuggestionsAndsortSuggestions(values) {
            var output = values[0];

            // Only the top result
            if (query.indexOf("http://") == -1) {
                //fetch domain suggestion
                var historySuggestion = values[1];

                if (typeof historySuggestion !== "undefined") {
                    if (historySuggestion.score < 50) {
                        output.splice(2, 0, historySuggestion);
                    } else {
                        output.splice(0, 0, historySuggestion);
                    }
                }
            }

            callback(output);
        }).otherwise(env.errhandler);

        // return getSuggestions.promise;
    };

    var doSearch = function(query) {
        var datumUrl = null;

        _.each(self.datums, function(datum) {
            if (query == datum.value) {
                datumUrl = datum.url;
            }
        });
        if (datumUrl) {
            redirectToUrl(datumUrl);
        } else if (isURL(query)) {
            redirectToUrl(datumUrl);
        } else {
            redirectToSearch(query);
        }
    };

    var isURL = function COMMON_isUrl(url) {
        return (url.indexOf("http://") === 0 || url.indexOf("https://") === 0 || url.indexOf("www.") === 0);
    }

    var redirectToUrl = function(url) {
        if (url.indexOf("http://") === -1 && url.indexOf("https://") === -1) url = "http://" + url;

        if (window.analytics) window.analytics.sendEvent({
            category: "Search",
            action: "Url",
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
                category: "Search",
                action: "Search",
                label: query,
                value: val
            }, function() {
                window.location.href = baseSearchUrl + query;
            });
        }
        setTimeout(function() {
            window.location.href = baseSearchUrl + query;
        }, 500);
    };

    var setupUI = function() {
        // widely used dom selectors
        self.$searchWrapper = Renderer.$layout.find(".search-wrapper").eq(0);
        // setup search layout
        self.$searchWrapper.html($(Template["search-wrapper"]()));

    }

    var focusOnSearch = function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.update(tab.id, {
                selected: true
            }, function() {
                $(".search-input").blur().focus();
            });
        });
    };

    Runtime.promise.then(init).otherwise(initting.reject);

    return self;
});
