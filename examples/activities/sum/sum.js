
exports.worker = function (task) {

    var input = JSON.parse(task.config.input);

    var result = input.a + input.b;

    console.log("sum Returning result : " + result);

    task.respondCompleted(result, function (err) {
        if (err) { console.error(err); return; }
        console.log("sum: respondComplete");
    });

};

