
var oauth = require('oauth'),
    querystring = require('querystring');

var config = require('./config');

var scope = "https://www.googleapis.com/auth/analytics.readonly";

var redirect_uri = 'http://localhost/oauth2callback';

var oa = new oauth.OAuth2(config.client_id,
                            config.client_secret,
                            "https://accounts.google.com/o",
                            "/oauth2/auth",
                            "/oauth2/token");

var authorizeUrl = oa.getAuthorizeUrl({scope: scope, response_type: 'code', redirect_uri: redirect_uri});

var exec = require('child_process').exec,
    child;

child = exec('open "' + authorizeUrl + '"', function (error, stdout, stderr) {});

var http = require('http');
http.createServer(function (req, res) {

    var code = querystring.parse(req.url.split('?')[1]).code;

    oa.getOAuthAccessToken(code, {grant_type: 'authorization_code', redirect_uri: redirect_uri}, function (err, access_token, refresh_token) {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end(err);
        } else {
            //console.log('access token: ' + access_token + '\n');
            //console.log('refresh token: ' + refresh_token);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(access_token);
        }
        process.exit(0);
    });

}).listen(80, '127.0.0.1');
