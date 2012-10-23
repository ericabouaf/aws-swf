/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var path = require('path'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var decisionTaskConfig = JSON.parse(process.argv[2]);

var accessKeyId = process.argv[3];
var secretAccessKey = process.argv[4];

var swfClient = swf.createClient({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

// Create the Decision task
var dt = new swf.DecisionTask(swfClient, decisionTaskConfig);

function workflowFailed(reason, details) {
   dt.fail_workflow_execution(reason, details, function(err) {
      if(err) { console.error(err); return; }
      console.log("Workflow marked as failed !");
   });
}

var workflowName = decisionTaskConfig.workflowType.name;

try {
   console.log("Trying to load workflow : "+workflowName);
   var workflow = require( path.join( process.cwd() , workflowName ) ).workflow;
   console.log("workflow module loaded !");
   
   try {
      workflow( dt );
   }
   catch(ex) {
      console.log(ex);
      workflowFailed("Error executing workflow decider "+workflowName, "");
   }
   
   if( !dt.responseSent ) {
      
      if( dt.decisions ) {
         console.log("sending decisions...");
         dt.respondCompleted(dt.decisions);
      }
      else {
         console.log("No decision sent and no decisions scheduled !");
         dt.fail("Don't know what to do...");
      }
      
   }
   
}
catch(ex) {
   console.log(ex);
   workflowFailed("Unable to load workflow module "+workflowName, "");
}