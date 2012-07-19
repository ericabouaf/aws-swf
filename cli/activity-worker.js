/**
 * Default worker process for swf-activity
 * This process is spawned for each new activity task received.
 * It will look in the working directory for a Node.JS module that has the same name as the activity-type
 */
var path = require('path'),
    swf = require('../index'),
    swfClient = swf.createClient();

// The task is given to this process as a command line argument in JSON format :
var taskConfig = JSON.parse(process.argv[2]);

// Create the ActivityTask
var task = new swf.ActivityTask(swfClient, taskConfig );

function activityFailed(reason, details) {
   task.respondFailed(reason, details, function(err) {
      if(err) { console.error(err); return; }
      console.log("respond failed !");
   });
}

var workerName = taskConfig.activityType.name;

try {
   console.log("Trying to load worker : "+workerName);
   var worker = require( path.join( process.cwd() , workerName ) ).worker;
   console.log("module loaded !");
   
   try {
      worker( task );
   }
   catch(ex) {
      console.log(ex);
      activityFailed("Error executing "+workerName, "");
   }
   
}
catch(ex) {
   console.log(ex);
   activityFailed("Unable to load module "+workerName, "");
}