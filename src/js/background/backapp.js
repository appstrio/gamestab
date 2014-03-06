angular.module('background', ['aio.storage', 'aio.image', 'aio.file', 'aio.chrome', 'aio.common.helpers']);
angular.module('background').controller('MainCtrl', [
    'searchSuggestions', 'Helpers',
    function (searchSuggestions, Helpers) {

        var defaultMaxSuggestions = 3;

        //Handles communication with main extension about suggestions
        function suggestionsHandler(port, msg) {
            //get suggestions
            if (msg.type === 'get') {
                //has search val
                if (msg.searchVal) {
                    searchSuggestions.getResults(msg.searchVal).then(function (data) {
                        var howMany = msg.howMany || defaultMaxSuggestions;
                        var returnResults = _.first(data, howMany);
                        var postObj = {
                            searchResults: returnResults
                        };
                        port.postMessage(postObj);
                    });
                }
            } else if (msg.type === 'init') {
                if (msg.params) {
                    searchSuggestions.init(msg.params);
                }
            }
        }
    }
]);
