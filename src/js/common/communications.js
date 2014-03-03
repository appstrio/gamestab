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
        function BackgroundApi(name) {
            if (!name) {
                return console.error('Missing name from Background Api');
            }
            if (typeof chrome === 'undefined' || !chrome.runtime) {
                return console.error('Chrome Api is missing. Use a different api');
            }

            //assign port name
            this.name = name;

            //assign port from chrome api
            this.port = chrome.runtime.connect({
                name: name
            });

            this.port.onDisconnect = function (e) {
                console.log('disc', e);
                this.port.onMessage.removeListener();
            };

            this.addListener = function (handler) {
                if (typeof handler !== 'function') {
                    return console.error('Handler must be a function');
                }

                this.msgHandler = handler;
                this.port.onMessage.addListener(handler);
            };

            this.removeListener = function () {
                this.port.onMessage.removeListener(this.msgHandler);
            };

            this.postMessage = function (params) {
                return this.port.postMessage(params);
            };

            return this;
        }

        return {
            BackgroundApi: BackgroundApi
        };
    }
]);
