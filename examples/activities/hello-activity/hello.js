/**
 * Activity to demonstrate the config.js usage.
 * This activity doesn't take any argument.
 */
exports.worker = function (task, config) {

	console.log("Starting hello-activity : " + JSON.stringify(config, null, 3));

    task.respondCompleted({
        greeting: "Hello " + config.name + " !"
    });

};
