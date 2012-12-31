
exports.worker = function (task) {

    var result = task.config.input;

    setTimeout(function () {

        task.respondCompleted(result, function (err) {
            if (err) { console.error(err); return; }
            console.log("sleep: respondComplete");
        });

    }, 2000);

};

