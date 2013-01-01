
exports.worker = function (task) {

    var params = task.config.input;

    setTimeout(function () {

        task.respondCompleted(params, function (err) {
            if (err) { console.error(err); return; }
            console.log("sleep: respondComplete");
        });

    }, params.delay || 2000);

};

