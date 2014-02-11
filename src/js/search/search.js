/* global _ */
var searchModule = angular.module('aio.search', []);

searchModule.directive('aioSearchBox', ['Analytics',

    function (Analytics) {
        return function (scope, element) {
            var throttleLimit = 100;
            element.focus();


            // get the results using a throttled function
            var getResults = _.throttle(function (val) {
                //build a list of recommended search results
                console.debug('typeahead guess', val);
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
                            window.location = 'http://www.google.com/search?q=' + val;
                        });
                    } else {
                        getResults(val);
                    }
                }
            });
        };
    }
]);
