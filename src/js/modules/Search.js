define(['underscore','promise!async_runtime', 'promise!async_config', 'renderer' ,'templates'], function Search(underscore,runtime, config, renderer ,templates) {

    var self = {},
        config = config.config;
    self.renderer = renderer;
    self.base_search_url = config.base_search_url;
    self.base_suggestions_url = config.base_suggestions_url;
    self.runtime = runtime;
    if (typeof self.runtime.runtime.location.country.short_name !== 'undefined')
        self.cc = self.runtime.runtime.location.country.short_name;

    self.render = function() {
        var searchWrapperInnerHTML = $(templates['search-wrapper']({}));
        self.renderer.$$searchWrapper.html(searchWrapperInnerHTML);

        _.defer(_.bind(self.setEventHandlers, self));
        _.defer(_.bind(self.setupTypeahead, self));

    };

    self.setEventHandlers = function() {
        self.renderer.$$searchWrapper.on('click', '.submit-button', function(e) {
            var query = self.renderer.$$searchWrapper.find('input').eq(0).val();

            self.doSearch(query);

        });

    };

    self.setupTypeahead = function() {
        // var input = self.renderer.$$searchWrapper.find('.search-input').eq(0);
        // input.typeahead({
        //     source: _.bind(self.getSuggestions, self),
        //     updater: function(item) {
        //         self.doSearch(item);
        //     }
        // });
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
        if (common.isUrl(query)) {
            self.redirectToUrl(query);
        } else {
            self.redirectToSearch(query);
        }
    }


    self.redirectToUrl = function(url) {
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

    self.redirectToSearch = function(query) {
        var val = window.analytics.getEventValue(self.cc);

        if (window.analytics) window.analytics.sendEvent({
            category: 'Search',
            action: 'Search',
            label: query,
            value: val
        }, function() {
            window.location.href = self.base_search_url + query;
        });

        setTimeout(function() {
            window.location.href = self.base_search_url + query;
        }, 500);
    };

    return self;
});
