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

define(["env", "jquery", "when", "typeahead", "Runtime", "Renderer", "templates", "underscore", "Analytics"], function Wintbar(env, $, when, typeahead, Runtime, Renderer, Template, _, Analytics) {
    "use strict";

    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : Wintbar");
    }
    var initting = when.defer(),
        self = {
            promise: initting.promise,
            datums: [],
        }, baseSearchUrl, baseSuggestionsURL, runtimeData;

    var init = function initModule(_runtimeData) {
        var runtimeConfig = Runtime.config;
        baseSearchUrl = runtimeConfig.base_search_url;
        baseSuggestionsURL = runtimeConfig.base_suggestions_url;
        runtimeData = _runtimeData;

        setupUI();

        setEventHandlers();
        setupTypeahead();

        focusOnSearch();

        return initting.resolve();
    };

    var searchHandler = function searchHandler() {
        var query = self.$typeahead.val();
        doSearch(query);
    };

    var setEventHandlers = function() {
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
        self.$typeahead.typeahead({
            name: "main",
            template: function renderTemplate(datum) {
                var url = typeof datum.url === "undefined" ? "" : datum.url;
                return "<p><a href=\"" + url + "\">" + datum.value + "</a></p>";
            },
            source: getSuggestions,
            updater: function(item) {
                doSearch(item);
            }
        });
        $(document).on("typeahead:selected", searchHandler);
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
            var bestEntriesStack = [],
                lastEntryScore = 0;
            _.each(historyEntries, function transformToTypeaheadDatums(rawDatum) {
                if (rawDatum.url.indexOf("file://") === -1 && rawDatum.url.indexOf("ftp://") === -1) {
                    var url = rawDatum.url;
                    if (url.charAt(url.length - 1) == "/") url = url.substr(0, url.length - 1);
                    self.datums.push({
                        url: url,
                        value: url.replace("www.", ""),
                        visitCount: rawDatum.visitCount,
                    });
                    self.datums.push({
                        url: url,
                        value: url.replace(/https?:\/\/?\.?/, ""),
                        visitCount: rawDatum.visitCount,
                    });
                    self.datums.push({
                        url: url,
                        value: url.replace(/https?:\/\/?\.?/, "").replace("www.", ""),
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
                        if (DEBUG && DEBUG.logSearchAlgorithm) {
                            console.log("For [" + query + "]:", entry.value, entry.visitCount, entryScore);
                        }
                        lastEntryScore = entryScore;
                        entry.score = entryScore;
                        bestEntriesStack.push(entry);
                    }
                }
            });

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
        if (!window.isChromeApp) {
            return callback && callback([]);
        }
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
        });

        // return getSuggestions.promise;
    };

    var doSearch = function(query) {
        var datumUrl = null;

        _.each(self.datums, function(datum) {
            if (query == datum.value) {
                datumUrl = datum.url;
            }
        });
        if(isURL(query)) {
            datumUrl = query;
        }
        var value = Analytics.getValByCC(runtimeData.countryCode);

        if (datumUrl) {
            Analytics.sendEvent({
                category: "Search",
                action: datumUrl,
                label: datumUrl,
                value: value,
            }, function() {
                redirectToUrl(datumUrl);
            });
        } else {
            Analytics.sendEvent({
                category: "Search",
                action: "Search",
                label: query,
                value: value,
            }, function() {
                redirectToSearch(query);
            });
        }
    };

    // var isURL = function COMMON_isUrl(url) {
    //     return (url.indexOf("http://") === 0 || url.indexOf("https://") === 0 || url.indexOf("www.") === 0);
    // };
    // From SO : http://stackoverflow.com/questions/1701898/how-to-detect-whether-a-string-is-in-url-format-using-javascript
    var isURLPattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", "i"
    ), // fragment locator
        isURL = function isURL(str) {
            return isURLPattern.test(str);
        };
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

        self.$typeahead = self.$searchWrapper.find(".search-input").eq(0);
    };

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
