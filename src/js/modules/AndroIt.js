"use strict";

define(['env', 'when', 'jquery'], function AndroIt(env, when, jquery) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Runtime");

    var initting = when.defer(),
        self = {}

    var init = function initModule() {
        var gettingToken = getUserToken(),
            getDevicesDetails = gettingToken.then(function(response) {
                self.userToken = response.userToken;
                return getDevices(response);
            }).otherwise(env.errhandler)

            getDevicesDetails.then(function(response) {
                debugger
                log('not implemented yet')
                return initting.resolve()
            }).otherwise(env.errhandler)

            return initting.promise
    };

    var getUserToken = function getUserToken() {
        var def = when.defer(),
            fetchingHTML = $.get('https://play.google.com');
        fetchingHTML.then(function(pageHTML) {

            var a = "window._uc='[\\42";
            var b = "\\42";

            var i = pageHTML.indexOf(a);
            if (i === -1) {
                return def.reject('Token not found')
            } else {
                pageHTML = pageHTML.substr(i + a.length);
                var j = pageHTML.indexOf(b);
                pageHTML = pageHTML.substr(0, j);
                def.resolve({
                    userToken: pageHTML
                })
            }
        }).fail(def.reject);

        return def.promise;
    }

    var getDevices = function getDevices(options) {
        var def = when.defer(),

            token = (options && options.token) || self.userToken,

            url = 'https://play.google.com/store/xhr/ructx?xhr=1&token=' + token,
            deviceIDs = [],
            fetchingHTML = $.post(url, function(response) {
                var step1 = response.split(")]}'\n")[1];
                // convert GodJSON into human JSON
                var step2 = step1.replace("\n",'');
                var json = step2.replace(',,',',"",'); // Google's JSON permits `,`` = empty values like that (Syntax error for human-JSON)
                var data = JSON.parse(json);
                var devicesDetails = data[0][0][2][10];
                debugger
                // step2 = pageHTML.split(']')

                if (pageHTML && pageHTML[4]) {
                    try {
                        pageHTML = pageHTML[4].split('","')[2];
                        pageHTML = pageHTML.split('"')[0];
                        deviceIDs.push(pageHTML)
                        def.resolve(deviceIDs)
                    } catch (e) {
                        def.reject('getDevices failed with ERR:' + e);
                    }
                } else {
                    def.reject('getDevices failed.');
                }

                self.devicesArr = pageHTML[0] && pageHTML[0][2] && pageHTML[0][2][10];
            }, 'html').fail(env.errhandler)

            return def.promise
    }

    var install = function install(appID, deviceID, options) {
        var url = 'https://play.google.com/store/install?xhr=1&token=' + token + '&id=' + appID + '&device=' + deviceID,
            def = when.defer(),
            postingInstallRequest = $.post(url),
            //If not using custom, refer to defaults on self
            token = (options && options.token) || self.userToken;

        debugger
        postingInstallRequest.resolve(def.resolve).fail(def.reject)

        return def.promise
    }

    var isInstalled = function isInstalled(appID, deviceID) {}


    init()

    return self;
});
