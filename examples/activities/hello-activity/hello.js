/**
 * Activity to demonstrate the config.js usage.
 * This activity doesn't take any argument.
 */
exports.worker = function (task, config) {

    task.respondCompleted({
        greeting: "Hello " + config.name + " !"
    }, function (err) {
        if (err) { console.error(err); return; }
        console.log("hello-activity: respondComplete");
    });

};
