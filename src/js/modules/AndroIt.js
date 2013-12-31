/**
 *
 * AndroIt Module - Remote installation of AndroidApps
 *
 * Use Cases:
 *   - Checking if user has a playstore account / is logged in -- Use the AndroIt.promise property. .then() will only happen if all previous conditions were met, .otherwise() will be called on any failure.
 *
 * Limitations:
 *   - Can"t install payed apps (POST request returns {ger:11} which I (wie) interpret as a status code of somesort)
 *
 **/
define(["env", "when", "jquery", "underscore", "Alert"], function AndroIt(env, when, jquery, _, Alert) {
    "use strict";
    if (DEBUG && DEBUG.logLoadOrder) {
        console.log("Loading Module : Runtime");
    }

    var initting = when.defer(),
        self = {
            promise: initting.promise,
            userToken: null,
            devicesList: [],

        };

    if (DEBUG && DEBUG.exposeModules) {
        window.AndroIt = self;
    }

    var init = function initModule() {
        console.log('window',window.isChromeApp)
        if(!window.isChromeApp){
            initting.reject();
            return initting.promise;
        }
        var gettingToken = getUserToken(),
            getDevicesDetails = gettingToken.then(function(response) {
                self.userToken = response.userToken;
                var gettingDevices = getDevices(response);
                return gettingDevices;
            });

        getDevicesDetails.done(function anyway() {
            return initting.resolve(self.devicesList.length > 0);
        }, initting.reject);

        return initting.promise;
    };

    var getUserToken = function getUserToken() {
        var def = when.defer(),
            fetchingHTML = $.get("https://play.google.com");
        fetchingHTML.done(function(pageHTML) {

            var v1 = /window\._uc='\[\\42(.*?)\\42,/,
                matches = pageHTML.match(v1);

            if (matches && matches.length && matches.length >= 2) {
                var userToken = matches[1];
                def.resolve({
                    userToken: userToken
                });
            } else {
                return def.reject("Token wasn't found");
            }
        }).fail(def.reject);

        return def.promise;
    };

    var getDevices = function getDevices(options) {
        var def = when.defer(),
            extract = when.defer(),

            token = (options && options.token) || self.userToken,

            url = "https://play.google.com/store/xhr/ructx?xhr=1&token=" + token,
            deviceIDs = [],
            fetchingHTML = $.post(url, function(response) {
                // For some reason, $.post doesn"t work with anything except an on-the-fly
                // anonymous function written as here. change at your own risk.

                var extracting = extractDevicesArrayFromGoogleJSON(response);
                extracting.then(extract.resolve).otherwise(extract.reject);
            }, "html").fail(env.errhandler);

        extract.promise.then(function storeDevices(devicesList) {
            self.devicesList = devicesList;
            def.resolve(devicesList);
        });

        return def.promise;
    };
    var extractDevicesArrayFromGoogleJSON = function extractDevicesArrayFromGoogleJSON(googlejson) {
        var data = parseGJSON(googlejson),
            devicesArray = data[0][2][10], // Location of devices in godJSON (stamp 23.12.13 [hasn"t changed in awhile, so stamp maybe un])
            devicesList = _.map(devicesArray, newDeviceObject);

        return when.resolve(devicesList);
    };

    // return - GodJSON into human JSON
    var parseGJSON = function(str) {
        // Remove linebreaks to permit next replaced, sine it won"t work with GodJSON"s multiple sudden and random line breaks of fury
        // Google"s JSON permits `,`` = empty values like that (Syntax error for human-JSON)
        var humanJSONStr = str.split(")]}\'\n")[1].replace(/\r?\n|\r/g, "").replace(/,,/g, ",\"\",");
        return JSON.parse(humanJSONStr);
    };

    self.install = function install(appID, deviceID, options) {
        var def = when.defer(),
            //If not using custom, refer to defaults on self
            token = (options && options.token) || self.userToken,
            deviceID = deviceID || self.devicesList[0].deviceID,
            url = "https://play.google.com/store/install?xhr=1&token=" + token + "&id=" + appID + "&device=" + deviceID,
            postingInstallRequest = $.post(url).always(function installingFailedHandler(response) {
                var gJSON = response.responseText,
                    json = parseGJSON(gJSON),
                    actualjson = json[0],
                    resp = {
                        unidentified0: actualjson[0], // usually : "gres"
                        unidentified1: actualjson[1], // usually : "1"
                        unidentified2: actualjson[2], // usually : ""
                        hash: actualjson[3], // usually some hash
                    },
                    stuff = resp.hash.match(/\u003d/g);

                if (stuff) {
                    if (stuff.length === 1) {
                        def.reject("App is already installed");
                    } else if (resp.hash.match(/\u003d/g).length === 2) {
                        def.resolve("App installed successfuly");
                    } else {
                        debugger;
                    }
                } else {
                    def.reject("Too many calls to PlayStore?");
                }
                Alert.show("A request has been sent to your device.");
            });

        return def.promise;
    };

    var isInstalled = function isInstalled(appID, deviceID) {};
    var newDeviceObject = function newDeviceObject(deviceDetails) {
        var Device = function(props) {
            // Last checked below information stamp 23.12.13
            this.vendorAndModelNames = props[0]; // e.g. "HTC HTC Desire X",
            this.deviceID = props[1]; // e.g. "g2ca054eec3cfdef1",
            this.vendorName = props[2]; // e.g. "HTC",
            this.deviceModelName = props[3]; // e.g. "HTC Desire X",
            this.Unidentified1 = props[4]; // e.g. 0,
            this.Unidentified2 = props[5]; // e.g. "",
            this.phoneImage = props[6]; // e.g. "https://lh5.ggpht.com/.*?-rw",
            this.Unidentified3 = props[7]; // e.g. "",
            this.Unidentified4 = props[8]; // e.g. "December 20,
            this.Unidentified5 = props[9]; // e.g.  2013",
            this.Unidentified6 = props[10]; // e.g. "December 12,
            this.Unidentified7 = props[11]; // e.g. 2012",
            this.Unidentified8 = props[12]; // e.g. "",
            this.Unidentified9 = props[13]; // e.g. 1
        };
        Device.prototype.toString = function() {
            return this.vendorAndModelNames;
        };

        return new Device(deviceDetails);
    };

    self.toObject = function toObject() {
        return {
            userToken: self.userToken,
            devices: self.devicesList,
        };
    };
    self.toString = function toString() {
        return JSON.stringify(this.toObject());
    };

    // Helpers
    //http://stackoverflow.com/questions/9907419/javascript-object-get-key-by-value
    var getKeyByValue = function(ob, value) {
        if (value) {
            for (var prop in ob) {
                if (ob.hasOwnProperty(prop)) {
                    if (ob[prop] === value) {
                        return prop;
                    }
                } else {
                    return null;
                }
            }
        }
    };

    init();

    return self;
});
