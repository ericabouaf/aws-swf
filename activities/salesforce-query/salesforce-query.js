
var sf = require('node-salesforce');

exports.worker = function (task, config) {

    // Login
    var conn = new sf.Connection({ loginUrl: config.loginUrl });
    conn.login(config.username, config.password, function (err) {

        if (err) {
            task.respondFailed(err, "");
            return;
        }

        console.log("SALESFORCE QUERY: Logged In !");

        // Query
        conn.query(task.config.input, function (err, results) {
            task.respondCompleted(results);
        });

    });

};
