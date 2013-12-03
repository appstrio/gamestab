function Weather(renderer, setup){
    var self = this;
    self.renderer = renderer;
    self.setup = setup;
    self.storage = new MyStorage();

    self.key = "weather";
    self.baseURL = "http://api.openweathermap.org/data/2.5/forecast/daily?mode=json"
    self.weekday=new Array(7);
    self.weekday[0]="Sunday";
    self.weekday[1]="Monday";
    self.weekday[2]="Tuesday";
    self.weekday[3]="Wednesday";
    self.weekday[4]="Thursday";
    self.weekday[5]="Friday";
    self.weekday[6]="Saturday";

    self.oldPeriod = 1000*3600*3;

    self.unitsByCountry = {
        us : 'imperial',
        uk : 'imperial',
        ca : 'imperial',
        nz : 'imperial',
        ir : 'imperial',
        in : 'imperial'
    };

};


Weather.prototype.buildURL = function(city, lat, lng, days, units){
    days = days || 5;
    units = units || 'metric';
    var url =  this.baseURL + '&cnt=' + days + '&units=' + units;
    if(city){
        url += '&q=' + city
    }else if(lat && lng){
        url += '&lat=' + lat + '&lon=' + lng;
    }

    return url;
};


Weather.prototype.mainWeatherIconChar = function(icon){
    /*
     01d.png	 01n.png	 sky is clear
     02d.png	 02n.png	 few clouds
     03d.png	 03n.png	 scattered clouds
     04d.png	 04n.png	 broken clouds
     09d.png	 09n.png	 shower rain
     10d.png	 10n.png	 Rain
     11d.png	 11n.png	 Thunderstorm
     13d.png	 13n.png	 snow
     50d.png	 50n.png	 mist
     */
    switch(icon){
        case '01d':
            return 'B';
            break;
        case '02d':
            return 'H';
            break;
        case '03d':
            return 'H'
            break;
        case '04d':
            return 'Q'
            break;
        case '09d':
            return 'R'
            break;
        case '10d':
            return 'X'
            break;
        case '11d':
            return 0
            break;
        case '13d':
            return 'W'
            break;
        case '50d':
            return 'L'
            break;
        case '01n':
            return 1;
            break;
        case '02n':
            return 3;
            break;
        case '03n':
            return 5;
            break;
        case '04n':
            return 7;
            break;
        case '09n':
            return 8;
            break;
        case '10n':
            return 8;
            break;
        case '11n':
            return '&';
            break;
        case '13n':
            return '#';
            break;
        case '50n':
            return '!'
            break;
    }
};

Weather.prototype.doGet = function(city, latitude, longitude, days, cc, done){
    var self = this;
    var units = self.unitsByCountry[cc] || 'metric';
    days = days || 5;

    $.getJSON(self.buildURL(city, latitude, longitude, days, units), function(data){
        var list = data.list, day, newDay, newArr = [];
        for(var i = 0; i<list.length;++i){
            day = list[i];
            var newDay = {
                icon : self.mainWeatherIconChar(day.weather[0].icon),
                temp : {
                    min : Math.round(day.temp.min) + ((units === 'metric') ? '&deg;' : ''),
                    max : Math.round(day.temp.max)  + ((units === 'metric') ? '&deg;' : '')
                },
                title : self.weekday[new Date(day.dt*1000).getDay()]
            }
            newArr.push(newDay);
        }

        self.days = newArr;
        self.store(newArr);

        (done||common.noop)(null, newArr);
    }, function(err){
        (done||common.noop)(true);
    });

};


Weather.prototype.get = function(params, done){
        if(!MY_CONFIG.config.with_weather) return (done||common.noop)(true);

        var self = this;
        var oldPeriod = this.oldPeriod;
        var city = params.city || self.setup.location.city.short_name;
        var cc = params.cc || self.setup.location.country.short_name;
        var days = params.days || 5;

        self.storage.get(self.key, function(_weather){
            console.log('local _weather',_weather)
            if(_weather && _weather.weather && Date.now() - _weather.weather.timestamp < oldPeriod){
                self.days = _weather[self.key].days;
                (done||common.noop)(null, _weather[self.key]);
            }else{
                if(city){
                    return self.doGet(city,null,null,days, cc, done);
                }else{
                    (done||common.noop)(true);
                }
            }
        }, function(err){
            (done||common.noop)(true);
        });
};


Weather.prototype.store = function(arr, done){
    var self = this;
    var objToStore = {};
    objToStore[self.key] = {
        days : arr,
        timestamp : Date.now()
    };
    self.storage.set(objToStore, done);
};


Weather.prototype.render = function(){
    var self = this;

    if(!self.renderer) return;

    if(!MY_CONFIG.config.with_weather){
        self.renderer.$wrapper.addClass('no-weather');
        return;
    }

    var html = templates['weather-wrapper']({days : self.days});

    self.renderer.$$weatherWrapper.html(html).removeClass('hide');
};
