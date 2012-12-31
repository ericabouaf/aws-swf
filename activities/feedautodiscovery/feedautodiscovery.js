
var request = require('request'),
    htmlparser = require("htmlparser"),
    async = require('async'),
    xml2js = require('xml2js-expat');

var feed_auto_discovery = function (url, cb) {
    request(url,  function (error, response, body) {
        var handler = new htmlparser.DefaultHandler(function (err, dom) {
            if (err) {
                cb(err, []);
            } else {
                var links = htmlparser.DomUtils.getElements({tag_name: 'link', rel: "alternate", type: 'application/rss+xml' }, dom);

                cb(null, links);
            }
        }, { verbose: false, ignoreWhitespace: true });
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(body);
    });
};

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

    var feeds = [];
    async.forEachSeries(urls, function (url, cb) {

        feed_auto_discovery(url, function (err, results) {
            feeds = feeds.concat(results);
            cb(err, results);
        });

    }, function () {

        var results = feeds.map(function (f) {
            var o = f.attribs;
            o["y:title"] = o.title;
            return o;
        });

        task.respondCompleted({
            feeds: results
        });
        
    });

};

