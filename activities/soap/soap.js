var soap = require('soap');

exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    try {

        soap.createClient(input.wsdlURL, function (err, client) {

            if (err) {
                task.respondFailed(err, "");
                return;
            }

            try {
                client[input.soapMethod](input.soapParams, function (err, results) {

                    if (err) {
                        task.respondFailed(err, "");
                        return;
                    }

                    task.respondCompleted(results);
                });

            } catch (ex) {
                task.respondFailed(ex, "");
            }
        });

    } catch (ex) {
        task.respondFailed(ex, "");
    }
};
