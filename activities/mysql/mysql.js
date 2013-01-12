var mysql = require('mysql');


exports.worker = function (task, config) {

    var connection = mysql.createConnection(config);

    connection.connect(function(err) {
        // connected! (unless `err` is set)
        if (err) {
            console.log(err);
            task.respondFailed(err);
            return;
        }

        connection.query(task.config.input, function(err, rows, fields) {
            if (err) {
                console.log(err);
                task.respondFailed(err);
                return;
            }

            //console.log('The solution is: ', rows[0].solution);

            task.respondCompleted(rows);

            connection.end();
        });

    });

};

