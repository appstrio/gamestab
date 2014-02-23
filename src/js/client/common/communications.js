angular.module('communications', []);

angular.module('communications').factory('bConnect', [

    function () {
        /**
         * RuntimeConnect
         *
         * @constructor
         * @param name Port name
         * @return
         */
        function RuntimeConnect(name) {
            this.name = name;

            this.port = chrome.runtime.connect({
                name: name
            });

            this.port.onDisconnect = function (e) {
                console.log('disc', e);
            }

            this.defineHandler = function (handler) {
                if (typeof handler !== 'function') {
                    return console.error('Handler must be a function');
                }

                this.msgHandler = handler;
                this.port.onMessage.addListener(handler);
            };

            this.postMessage = function (params) {
                return this.port.postMessage(params);
            };

            return this;
        }

        return {
            RuntimeConnect: RuntimeConnect
        };
    }
]);
