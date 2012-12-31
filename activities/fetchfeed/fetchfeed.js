
var request = require('request'),
    xml2js = require('xml2js-expat'),
    async = require('async');

var fetch_feed = function (url, cb) {

    request(url, function (error, response, body) {

        console.log("Got response. Code = " + response.statusCode);

        if (!error && response.statusCode === 200) {
            var r = body;
            var contentType = response.headers["content-type"].split(';')[0];
            if (contentType) {

                console.log("contentType = " + contentType);

                // Parsing XML
                var feed_content_types = ["text/xml", "application/rss+xml", "application/xml"];
                if (feed_content_types.indexOf(contentType) !== -1) {
                    console.log("parsing...");
                    var parser = new xml2js.Parser();
                    parser.addListener('end', function (r) {
                        //console.log(r);
                        var result = r.channel ? r.channel.item : r.entry;
                        cb(null, result);
                    });
                    parser.addListener('error', function (r) {
                        console.log("Error parsing feed...");
                    });
                    parser.parseString(body);
                    return;
                }
            }

        } else {
            // TODO: we should indicate errors in the response
            cb(null, []);
        }
    });
};

var fetch_feeds = function (urls, cb) {

    var items = [];
    async.forEachSeries(urls, function (url, cb) {

        fetch_feed(url, function (err, result) {
            items = items.concat(result);
            cb(err, result);
        });

    }, function () {
        cb(null, items);
    });

};

exports.fetch_feeds = fetch_feeds;

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    // fetch must be able to get multiple URLs 
    var urls = [];
    if (Array.isArray(input.URL)) {
        input.URL.forEach(function (u) {
            urls.push(u);
        });
    } else {
        urls.push(input.URL);
    }

    console.log(urls);

    fetch_feeds(urls, function (err, items) {
        task.respondCompleted({
            entries: items
        });
    });

};

