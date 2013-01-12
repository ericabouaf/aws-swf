/**
 * Default worker process for swf-activity
 * This process is spawned for each new activity task received.
 * It will look in the working directory for a Node.JS module that has the same name as the activity-type
 */
var path = require('path'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var taskConfig = JSON.parse(process.argv[2]);

// AWS credentials
var accessKeyId = process.argv[3],
    secretAccessKey = process.argv[4];

var swfClient = swf.createClient({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

// Optional fetchConfigData
var fetchConfigData = (process.argv.length >= 5) ? process.argv[5] : null;

// Create the ActivityTask
var task = new swf.ActivityTask(swfClient, taskConfig);

function activityFailed(reason, details) {
    task.respondFailed(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("respond failed !");
    });
}

// Fetchconfigfile must be a js file exporting the 'fetch_config' method
// signature: function(workerName, fetchConfigData, function (err, config) {...})
var fetchconfigfile = process.argv[5],
    fetch_config;

try {
    fetch_config = require(fetchconfigfile).fetch_config;
} catch (ex) {
    console.log(ex);
    activityFailed("Unable to load for fetchconfigfile, or does not export fetch_config : " + fetchconfigfile, ex.message);
}

var workerName = taskConfig.activityType.name;

try {

    // Load the worker module 
    //  Simple module : 'soap' -> require('soap').worker
    //  or multiple activities package: 'ec2_runInstances' -> require('ec2').runInstances
    console.log("Trying to load worker : " + workerName);

    var split = workerName.split('_');
    var packageName = split[0],
        workerName = "worker";
    if(split.length > 1) {
        workerName = split[1];
    }
    var worker = require(path.join(process.cwd(), packageName))[workerName];

    console.log("module loaded !");

    // Use the asynchronous method to get the config for this module
    fetch_config(packageName, fetchConfigData, function (err, config) {

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
