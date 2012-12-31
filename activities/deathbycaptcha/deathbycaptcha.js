var http = require('http'),
    fs = require('fs'),
    querystring = require('querystring'),
    request = require('request'),
    URL = require('url');

exports.worker = function (task, config) {

    var pollLoop = function (captchaId) {

        console.log("DEATHBYCAPTCHA Wait 30s before polling...");
        setTimeout(function () {

            console.log("DEATHBYCAPTCHA checking response");
            var url = "http://api.dbcapi.me/api/captcha/" + captchaId;

            request.get(url, function (error, response, body) {

                var results = querystring.parse(body);

                console.log("DEATHBYCAPTCHA statusCode", response.statusCode);
                console.log("DEATHBYCAPTCHA response", results);

                if (results.text === "" || results.text === undefined) {
                    pollLoop();
                } else {
                    console.log("DEATHBYCAPTCHA Got response : " + results.text);

                    task.respondCompleted({captcha_text: results.text}, function (err) {
                        if (err) { console.error(err); return; }
                        console.log("temboo: respondComplete");
                    });
                }
            });
        }, 30000);
    };

    var encodeFieldPart = function (boundary, name, value) {
        var return_part = "--" + boundary + "\r\n";
        return_part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
        return_part += value + "\r\n";
        return return_part;
    };

    var encodeFilePart = function (boundary, type, name, filename) {
        var return_part = "--" + boundary + "\r\n";
        return_part += "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n";
        return_part += "Content-Type: " + type + "\r\n\r\n";
        return return_part;
    };

    var makePost = function (post_data, boundary) {

        var length = 0, i;

        for (i = 0; i < post_data.length; i++) {
            length += post_data[i].length;
        }

        var post_options = {
            host: 'api.dbcapi.me',
            port: '80',
            path: '/api/captcha',
            method: 'POST',
            headers : {
                'Content-Type' : 'multipart/form-data; boundary=' + boundary,
                'Content-Length' : length
            }
        };

        var post_request = http.request(post_options, function (response) {
            response.setEncoding('utf8');

            var complete = "";
            response.on('data', function (chunk) {
                complete += chunk;
            });
            response.on('end', function () {

                var results = querystring.parse(complete);
                console.log("DEATHBYCAPTCHA", results); // { status: '0', captcha: '33064108', text: '', is_correct: '1' }

                pollLoop(results.captcha);

            });

        });

        for (i = 0; i < post_data.length; i++) {
            post_request.write(post_data[i]);
        }
        post_request.end();
    };

    var preparePost = function () {
        var boundary = Math.random();
        var post_data = [];

        post_data.push(new Buffer(encodeFieldPart(boundary, 'username', config.USERNAME), 'ascii'));
        post_data.push(new Buffer(encodeFieldPart(boundary, 'password', config.PASSWORD), 'ascii'));
        post_data.push(new Buffer(encodeFilePart(boundary, 'image/jpeg', 'captchafile', config.CAPTCHA_FILE), 'binary'));

        var file_reader = fs.createReadStream(__dirname + '/' + config.CAPTCHA_FILE, {encoding: 'binary'});
        var file_contents = '';
        file_reader.on('data', function (data) {
            file_contents += data;
        });
        file_reader.on('end', function () {
            post_data.push(new Buffer(file_contents, 'binary'));
            post_data.push(new Buffer("\r\n--" + boundary + "--"), 'ascii');
            makePost(post_data, boundary);
        });
    };


    var input = JSON.parse(task.config.input);

    var url = URL.parse(input.url);

    http.get({
        host: url.host,
        port: url.port,
        path: url.path
    }, function (res) {

        var imagedata = '';
        res.setEncoding('binary');

        res.on('data', function (chunk) {
            imagedata += chunk;
        });

        res.on('end', function () {
            fs.writeFile(__dirname + '/' + config.CAPTCHA_FILE, imagedata, 'binary', function (err) {
                if (err) { throw err; }
                console.log('DEATHBYCAPTCHA File saved.');
                preparePost();
            });
        });
    });


};
