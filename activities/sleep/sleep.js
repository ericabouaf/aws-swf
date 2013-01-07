
exports.worker = function (task) {

    var params;
    try {
        params = JSON.stringify(task.config.input);
    }
    catch(ex) {}

    setTimeout(function () {

        task.respondCompleted(params, function (err) {
            if (err) { console.error(err); return; }
            console.log("sleep: respondComplete");
        });

    }, params ? params.delay || 2000 : 2000);

};

