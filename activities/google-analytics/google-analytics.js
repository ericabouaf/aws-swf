// Cf DOC :
// https://developers.google.com/analytics/devguides/reporting/core/v3/reference
// https://developers.google.com/analytics/devguides/reporting/core/dimsmets

var oauth = require('oauth'),
    querystring = require('querystring');

exports.worker = function (task, config) {

    var scope = "https://www.googleapis.com/auth/analytics.readonly";

    var oa = new oauth.OAuth2(config.client_id,
                              config.client_secret,
                              "https://accounts.google.com/o",
                              "/oauth2/auth",
                              "/oauth2/token");

    // TODO: in task input !
    var q = {
        "ids": "ga:24583775",
        "start-date": "2011-01-01",
        "end-date": "2012-06-30",
        "metrics": "ga:visits",
        "dimensions": "ga:nthMonth",
        "filters": "ga:pagePath=@FRYROC"
    };

    oa.getProtectedResource(
        "https://www.googleapis.com/analytics/v3/data/ga?" + querystring.stringify(q),
        config.access_token,
        function (error, data, response) {

            if (error) {
                console.log(error);
                // TODO: taskFailed
                return;
            }

            var feed = JSON.parse(data);
            task.respondCompleted(feed);
        }
    );

};

