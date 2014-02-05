var settingsModule = settingsModule || angular.module('aio.settings', []);

settingsModule.factory('Config', [ 'Constants', 'Storage', function(C, Storage){
    var data = {},
        storageKey = C.STORAGE_KEYS.CONFIG;


    /**
     *
     */
    var init = function(){
        Storage.get(storageKey)
    };


    /**
     *
     * @returns {{}}
     */
    var getter = function(){
        return data;
    };



    /**
     * Setup config for the first time
     * @returns {promise}
     */
    var setup = function(){
        var setupping = $q.defer();

        // get partners.json from remote
        partnersJSONUrl().success(function(gamestabJSON){
            // decide which partner
            decidePartner(gamestabJSON.partners).then(function(partnerObject){
                loadPartnerJSON.then(partnerObject, function(partnerJSON){
                    // finish setup as partner
                    finishSetup(setupping, partnerJSON)();
                }, finishSetup(setupping));
            }, finishSetup(setupping));
        }).error(finishSetup(setupping));

       // partnersJSONUrl().then(decidePartner).then().then(function(){}, finishSetup(setupping));
        return setupping.promise;
    };


    /**
     * Get the remote games tab json
     * @returns {$http promise}
     */
    var partnersJSONUrl = function(){
        return $http.get(C.PARTNERS_JSON_URL);
    };



    /**
     * Decide which partner "owns" the app by the partner object install_url_snippit
     * @returns {promise(PARTNER_SETUP_OBJECT)}
     */
    var decidePartner = function(partnersList){
        var deciding = $q.defer();
        if(!partnersList || !partnersList.length){
            deciding.reject(C.ERRORS.SETUP.PARTNER_NOT_FOUND);
        }else{
            async.detect(partnersList, function(partner, cb){
                chrome.history.search({text : partner.partner_install_url_snippit}, function(found){
                    if(found.length){
                        cb(partner);
                    }
                });
            }, function(partner){
                if(partner){
                    deciding.resolve(partner);
                }else{
                    deciding.reject();
                }
            });
        }
        return deciding.promise;
    };


    /**
     * Load partner json from remote
     * @returns {$http promise}
     */
    var loadPartnerJSON = function(partnerObject){
        return $http.get(partnerObject.partner_config_json_url);
    };


    /**
     *
     */
    var finishSetup = function(setupping, partnerJSON){
        return function(){
            data = angular.extend(C.CONFIG, partnerJSON || {});
            store(setupping.resolve);
        }
    };


    /**
     *
     * @returns {promise|*}
     */
    var store = function(){
        var storing = $q.defer();
        Storage.setItem(storageKey, data, function(){
            storing.resolve();
        });
        return storing.promise;
    }


    return {
        init    : init,
        get     : getter,
        setup   : setup
    }

}]);