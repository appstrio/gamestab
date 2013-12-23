"use strict";

define(['env', 'when', 'jquery', 'underscore'], function AndroIt(env, when, jquery, _) {
    if (env.DEBUG && env.logLoadOrder) console.log("Loading Module : Runtime");

    var initting = when.defer(),
        self = {}

    if(env.DEBUG) window.and = self;

    var init = function initModule() {
        var gettingToken = getUserToken(),
            getDevicesDetails = gettingToken.then(function(response) {
                self.userToken = response.userToken;
                var gettingDevices = getDevices(response);
                return gettingDevices;
            }).otherwise(env.errhandler)

            getDevicesDetails.then(function(devicesList) {
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
        var def = when.defer(), extract = when.defer(),

            token = (options && options.token) || self.userToken,

            url = 'https://play.google.com/store/xhr/ructx?xhr=1&token=' + token,
            deviceIDs = [],
            fetchingHTML = $.post(url, function(response) {
                // For some reason, $.post doesn't work with anything except an on-the-fly
                // anonymous function written as here. change at your own risk.

                var extracting = extractDevicesArrayFromGoogleJSON(response);
                extracting.then(extract.resolve).otherwise(extract.reject);
            }, 'html').fail(env.errhandler)

            extract.promise.then(function storeDevices(devicesList) {
                self.devicesList = devicesList;
                def.resolve(devicesList)
            }).otherwise(env.errhandler)

            return def.promise
    }
    var extractDevicesArrayFromGoogleJSON = function extractDevicesArrayFromGoogleJSON(googlejson) {
        var data = parseGJSON(googlejson),
            devicesArray = data[0][2][10], // Location of devices in godJSON (stamp 23.12.13 [hasn't changed in awhile, so stamp maybe un])
            devicesList = _.map(devicesArray, newDeviceObject)

        return when.resolve(devicesList)
    }

    // return - GodJSON into human JSON
    var parseGJSON = function(str) {
        // Remove linebreaks to permit next replaced, sine it won't work with GodJSON's multiple sudden and random line breaks of fury
        // Google's JSON permits `,`` = empty values like that (Syntax error for human-JSON)
        var humanJSONStr = str.split(")]}'\n")[1].replace(/\r?\n|\r/g, "").replace(/,,/g,',"",');
        return JSON.parse(humanJSONStr)
    }

    self.install = function install(appID, deviceID, options) {
        var def = when.defer(),
            //If not using custom, refer to defaults on self
            token = (options && options.token) || self.userToken,
            deviceID = deviceID || self.devicesList[0].deviceID,
            url = 'https://play.google.com/store/install?xhr=1&token=' + token + '&id=' + appID + '&device=' + deviceID,
            postingInstallRequest = $.post(url, function(resp) {
                var gJSON = resp.responseText,
                    json = parseGJSON(gJSON)
                def.resolve(json)
            }).fail(function installingFailedHandler(resp) {
                var gJSON = resp.responseText,
                    json = parseGJSON(gJSON)
                def.reject(json)
            });

        return def.promise
    }

    var isInstalled = function isInstalled(appID, deviceID) {}
    var newDeviceObject = function newDeviceObject(deviceDetails) {
        var Device = function (props) {
            // Last checked below information stamp 23.12.13
            this.vendorAndModelNames = props[0]; // e.g. "HTC HTC Desire X",
            this.Unidentified0       = props[1]; // e.g. "g2ca054eec3cfdef1",
            this.vendorName          = props[2]; // e.g. "HTC",
            this.deviceModelName     = props[3]; // e.g. "HTC Desire X",
            this.Unidentified1       = props[4]; // e.g. 0,
            this.Unidentified2       = props[5]; // e.g. "",
            this.phoneImage          = props[6]; // e.g. "https://lh5.ggpht.com/wNAVXRUp1wFh1ErTDobmUUaHAeqCS0xTiBpEkDRiwZ2CPkC2ibOdjlIXtjXAcD_mQeXe=w50-h50-rw",
            this.Unidentified3       = props[7]; // e.g. "",
            this.Unidentified4       = props[8]; // e.g. "December 20,
            this.Unidentified5       = props[9]; // e.g.  2013",
            this.Unidentified6       = props[10]; // e.g. "December 12,
            this.Unidentified7       = props[11]; // e.g. 2012",
            this.Unidentified8       = props[12]; // e.g. "",
            this.Unidentified9       = props[13]; // e.g. 1
        }
        Device.prototype.toString = function () { return this.vendorAndModelNames; }

        return new Device(deviceDetails);
    }

    init()

    return self;
});
