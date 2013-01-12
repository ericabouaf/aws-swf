var deathbycaptcha = require('deathbycaptcha2');

exports.worker = function (task, config) {

    deathbycaptcha.credentials = {
        username: config.username,
        password: config.password
    };

    var input = JSON.parse(task.config.input);

    deathbycaptcha.decodeUrl(input.url, 10000, function(err, result) {

        task.respondCompleted({captcha_text: result.text}, function (err) {
            if (err) { console.error(err); return; }
            console.log("deathbycaptcha: respondComplete");
        });

    });
    
};
