define(function Search(require) {

    var self = {
        base_search_url: '',
        base_suggestions_url: ''
    }, renderer = require('rendererSearch');

    self.setEventHandlers = function() {
        renderer.$searchWrapper.on('click', '.submit-button', function(e) {
            var query = renderer.$searchWrapper.find('input').eq(0).val();
            self.doSearch(query);
        });
    }
    self.setupTypeahead = function() {
        require('typeahead');
        var input = renderer.$searchWrapper.find('.search-input').eq(0);
        input.typeahead({
            source: self.getSuggestions,
            updater: function(item) {
                self.doSearch(item);
            }
        });
    };

    self.getSuggestions = function(query, process) {
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

    self.doSearch = function(query) {
        // if (common.isUrl(query)) { //TODO : Who would type a URL into a search box? (especially with our users) \ do we really want a whole lib for one fun?
        //     self.redirectToUrl(query);
        // } else {
        self.redirectToSearch(query);
        // }
    };

    self.redirectToUrl = function(url) {
        if (url.indexOf('http://') !== 0) url = 'http://' + url;

        // if (window.analytics) window.analytics.sendEvent({
        //     category: 'Search',
        //     action: 'Url',
        //     label: url,
        //     value: 0
        // }, function() {
        //     window.location.href = url;
        // });

        setTimeout(function() {
            window.location.href = url;
        }, 500);
    };

    self.redirectToSearch = function(query) {
        // if(window.analytics) {
        //     var val = window.analytics.getEventValue(self.cc);

        //     if (window.analytics) window.analytics.sendEvent({
        //         category: 'Search',
        //         action: 'Search',
        //         label: query,
        //         value: val
        //     }, function() {
        //         window.location.href = self.base_search_url + query;
        //     });
        // }
        setTimeout(function() {
            window.location.href = self.base_search_url + query;
        }, 500);
    };

    self.init = (function() {
        var $             = require('jquery'),
            runtime
 = require('runtime
');
        //TODO should we timeout 0 to increase speed?
        runtime
.promise.then(function(runtime) {
            self.base_search_url = runtime.base_search_url;
            self.base_suggestions_url = runtime.base_suggestions_url;

            self.setEventHandlers()
            self.setupTypeahead()
        });
        // self.cc = self.runtime.runtime.location.country.short_name;
    })();

    return self;
}, rErrReport);
