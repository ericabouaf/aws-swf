var xmlrpc = require('xmlrpc'),
    URL = require('url');

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    var url = URL.parse(input.url);

    var client = xmlrpc.createClient({ host: url.host, port: url.port || 80, path: url.path});

    client.methodCall(input.xmlrpcMethod, input.xmlrpcParams, function (err, value) {

        if (err) {
            task.respondFailed(err, "");
            return;
        }

        task.respondCompleted(value);
    });

};

