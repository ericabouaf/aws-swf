var querystring = require('querystring'),
    request = require('request');

var search_location = function (address, cb) {


    var url = 'http://maps.googleapis.com/maps/api/geocode/json';

    var q = {
        sensor: 'false',
        address: address
    };

    url += '?' + querystring.stringify(q);

    request(url, function (error, response, body) {

        var gmapsResults = JSON.parse(body).results[0];

        var h = {};
        gmapsResults.address_components.forEach(function (c) {
            c.types.forEach(function (t) {
                if (t === 'country') {
                    h[t] = c.long_name;
                } else {
                    h[t] = c.short_name;
                }
            });
        });

        cb({
            "street_number": h.street_number,
            "street": h.route,
            "country": h.country,
            "postal": h.postal_code,
            "state": h.administrative_area_level_1,
            "city": h.locality,
            "lat": gmapsResults.geometry.location.lat,
            "lon": gmapsResults.geometry.location.lng,
            "quality": "50"
        });

    });

};

exports.search_location = search_location;

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    search_location(input.LOCATION, function (response) {

        task.respondCompleted(response);

    });

};

