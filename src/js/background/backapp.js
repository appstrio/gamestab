angular.module('backgroundService', ['chromeWrapper']);

angular.module('backgroundService').controller('MainCtrl', [
    'searchSuggestions', 'Chrome',
    function (searchSuggestions, chromeWrapper) {

        var maxSuggestions = 3;
        /**
         * suggestionsHandler
         * Handles communication with main extension about suggestions
         *
         * @param port
         * @param msg
         * @return
         */
        function suggestionsHandler(port, msg) {
            //get suggestions
            if (msg.type === 'get') {
                //has search val
                if (msg.searchVal) {
                    searchSuggestions.getResults(msg.searchVal).then(function (data) {
                        var howMany = msg.howMany || maxSuggestions;
                        var returnResults = _.first(data, howMany);
                        port.postMessage({
                            searchResults: returnResults
                        });
                    });
                }
            }
        }

        function chromeHandler(port, msg) {
            console.log('Filename: backapp.js', 'Line: 33', 'msg:', msg);
        }

        /**
         * Wrapper for chrome runtime communications with client
         *
         * @return
         */
        chrome.runtime.onConnect.addListener(function (port) {
            if (port.name === 'suggestions') {
                port.onMessage.addListener(suggestionsHandler.bind(null, port));
            } else if (port.name === 'chrome') {
                port.onMessage.addListener(chromeHandler.bind(null, port));
            } else {
                console.error('unrecognized port name', port.name);
            }
        });
    }
]);
