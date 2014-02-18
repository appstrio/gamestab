//global
var _gaq = _gaq || [];

angular.module('aio.analytics').factory('Analytics', [
    '$rootScope', '$log', '$q', 'Constants', '$timeout', 'Config', 'AnalyticsEvents',
    function ($rootScope, $log, $q, C, $timeout, Config, AnalyticsEvents) {
        var events = AnalyticsEvents;
        /**
         * init
         * Load the analytics script
         *
         * @return
         */
        var init = function () {
            $log.log('[Analytics] - init');
            //init account
            (function () {
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = 'https://ssl.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);
            })();

            console.debug('Setting up online analytics ID of ' + C.ANALYTICS_UA_ACCOUNT);
            //register account
            _gaq.push(['_setAccount', C.ANALYTICS_UA_ACCOUNT]);
            //required for newtab with no domain
            _gaq.push(['_setDomainName', 'none']);
            //track pageview
            _gaq.push(['_trackPageview']);
            //track partnerid or default
            _gaq.push(['_setCustomVar', 1, 'partner_id', Config.get().partner_id, 1]);
            //report app_load
            reportEvent(501, {
                label: C.APP_VERSION
            });
            $log.log('[Analytics] - done loading...');
        };

        /**
         * getEventArray
         * generate an event array to report to analytics
         * @private
         *
         * @param eventId
         * @param params
         * @return
         */
        var _getEventArray = function (eventId, params) {
            var _event;

            //if eventId isn't found
            if (!events[eventId]) {
                return null;
            }

            //get the known event details from list
            _event = angular.extend({}, events[eventId]);

            //set defaults
            //if value is a number report it
            _event.value = typeof params.value === 'number' ? params.value : 1;
            _event.opt_noninteraction = false;
            //report label as string
            _event.label = typeof params.label !== 'undefined' ? String(params.label) : '';

            switch (eventId) {

            case 501:
                //set as non-interaction
                _event.opt_noninteraction = true;
                break;
            default:
                break;
            }

            return _event;
        };

        /**
         * reportEvent
         * report an event to analytics
         *
         * @param {number} eventId the event Id
         * @param params
         * @param {Booolean} [params.waitForFinish] should wait for callback to finish and then return a promise
         * @return {Promise|Boolean}
         */
        var reportEvent = function (eventId, params) {
            var deferred = $q.defer();
            //max delay in hit callback
            var hitCallbackMaxDelay = 400;
            params = params || {};
            var _event = _getEventArray(eventId, params);

            if (!_event || !_event.category || !_event.action) {
                $log.log('[Analytics] - Error in reporting event. Missing fields', _event);
                return false;
            }

            //if needing to wait for finish, such as when tracking outbound links
            if (params.waitForFinish) {
                _gaq.push(['_set', 'hitCallback',
                    function () {
                        $rootScope.$apply(function () {
                            deferred.resolve();
                        });
                    }
                ]);

                $timeout(function () {
                    deferred.resolve();
                }, hitCallbackMaxDelay);
            }

            //report analtyics event
            _gaq.push(['_trackEvent', _event.category, _event.action,
                _event.label, _event.value, _event.opt_noninteraction
            ]);

            return deferred.promise;
        };

        return {
            init: init,
            reportEvent: reportEvent
        };
    }
]);
