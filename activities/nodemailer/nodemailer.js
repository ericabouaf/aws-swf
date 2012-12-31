var nodemailer = require("nodemailer");

exports.worker = function (task, config) {

    var smtpTransport = nodemailer.createTransport(config.transport.type, config.transport.options);

    var mailOptions = JSON.parse(task.config.input);

    smtpTransport.sendMail(mailOptions, function (err, response) {

        if (err) {
            task.respondFailed(err, "");
            return;
        }

        console.log("nodemailer worker sent: " + response.message);

        smtpTransport.close();

        task.respondCompleted({message: response.message});

    });

};

