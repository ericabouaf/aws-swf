var request = require('request');

// input = { to: to, msg: msg, label: label, title: label, uri: url}

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    try {

        request({
            url: 'https://' + config.username + ':' + config.key + '@api.notifo.com/v1/send_notification',
            method: 'POST',
            form: input
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                task.respondCompleted(body);
            } else {
                task.respondFailed(error, body);
            }
        });

    } catch (ex) {
        task.respondFailed(ex, "");
    }
};

