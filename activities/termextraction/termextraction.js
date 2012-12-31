
var request = require('request'),
    querystring = require('querystring');

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    console.log(task.config.input);

    var q = {
        q: 'select * from search.termextract where context=' + JSON.stringify(input.text),
        format: "json",
        diagnostics: "false"
    };

    var url = "http://query.yahooapis.com/v1/public/yql?" + querystring.stringify(q);

    request(url, function (error, response, body) {

        console.log("Got response. Code = " + response.statusCode);

        if (!error && response.statusCode === 200) {

            var result = JSON.parse(body).query.results.Result;
            var results = [];
            if (Array.isArray(result)) {
                results = result.map(function (i) { return {content: i}; });
            }

            task.respondCompleted({
                terms: results
            });

        }
    });


};

