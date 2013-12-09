define(['jquery'], function Geo($) {
    var self = {};
    self.gMapsBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=";

    self.buildGMapsUrl = function(latLng) {
        return this.gMapsBaseUrl + latLng;
    };

    self.getLatLng = function(done) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            if (pos && pos.coords) {
                done({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                });
            } else {
                done({});
            }
        });
    };

    self.get = function(done) {
        self.getLatLng(function(pos) {
            if (pos && pos.latitude && pos.longitude) {
                var latLngString = pos.latitude + ',' + pos.longitude;
                $.getJSON(self.buildGMapsUrl(latLngString), function(data) {
                    if (data.results) {
                        var locationTemp = data.results[0];
                        var addressComponents = locationTemp.address_components;

                        var location = {
                            country: addressComponents[3],
                            city: addressComponents[2],
                            address: locationTemp.formatted_address
                        };

                        done && done(null, location);

                    } else {
                        done && done(true);
                    }
                }, function(err) {
                    console.error('err', err);
                    done && done(true);
                })
            } else {
                done && done(true);
            }
        });
    };
    return self;
});
