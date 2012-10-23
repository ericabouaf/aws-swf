/**
 * Default worker process for swf-activity
 * This process is spawned for each new activity task received.
 * It will look in the working directory for a Node.JS module that has the same name as the activity-type
 */
var path = require('path'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var taskConfig = JSON.parse(process.argv[2]);

var accessKeyId = process.argv[3];
var secretAccessKey = process.argv[4];

var swfClient = swf.createClient({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

var fetchconfigfile = process.argv[5];

// Create the ActivityTask
var task = new swf.ActivityTask(swfClient, taskConfig);

function activityFailed(reason, details) {
    task.respondFailed(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("respond failed !");
    });
}

var workerName = taskConfig.activityType.name;

var fetch_config = require(fetchconfigfile).fetch_config;

try {
    console.log("Trying to load worker : " + workerName);
    var worker = require(path.join(process.cwd(), workerName)).worker;
    console.log("module loaded !");

    // Use the asynchronous method to get the config for this module
    fetch_config(workerName, function (err, config) {

        if (err) {
            console.log(err);
            activityFailed("Unable to get config for: " + workerName, "");
            return;
        }

        try {
            worker(task, config);
        } catch (ex) {
            console.log(ex);
            activityFailed("Error executing " + workerName, "");
        }
    });

} catch (ex) {
    console.log(ex);
    activityFailed("Unable to load module " + workerName, "");
}
