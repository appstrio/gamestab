function Geo(){
    var self = this;
    self.gMapsBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng=";


}


Geo.prototype.buildGMapsUrl = function(latLng){
    return this.gMapsBaseUrl + latLng;
};


Geo.prototype.getLatLng = function(done){
    navigator.geolocation.getCurrentPosition(function(pos){
            if(pos && pos.coords){
                done({
                    latitude : pos.coords.latitude,
                    longitude : pos.coords.longitude
                });
            }else{
                done({});
            }
    });
};


Geo.prototype.get = function(done){
    var self = this;
    self.getLatLng(function(pos){
        if(pos && pos.latitude && pos.longitude){
            var latLngString = pos.latitude + ',' + pos.longitude;
            $.getJSON(self.buildGMapsUrl(latLngString),function(data){
                if(data.results){
                    var locationTemp = data.results[0];
                    var addressComponents = locationTemp.address_components;

                    var location = {
                        country : addressComponents[3],
                        city : addressComponents[2],
                        address : locationTemp.formatted_address
                    };

                    (done||common.noop)(null, location);

                }else{
                    (done||common.noop)(true);
                }
            },function(err){
                console.error('err',err);
                (done||common.noop)(true);
            })
        }else{
            (done||common.noop)(true);
        }
    });

};
