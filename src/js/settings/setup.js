var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Setup', ['$rootScope', 'Constants','$q','$http','Apps','Config', 'Storage', function($rootScope, C, $q,$http, Apps, Config, Storage){

    /**
     * Initiates Setup
     * @returns {promise}
     */
    var startSetup = function(){
        var setupping = $q.defer();

        // SETUP CONFIG
        Config.setup().then(function(_config){
            Preferences.setup();
        }, function(){
            setupping.reject();
        });

        return setupping.promise;
    };




}]);