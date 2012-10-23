/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var path = require('path'),
    vm = require('vm'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var decisionTaskConfig = JSON.parse(process.argv[2]);

var accessKeyId = process.argv[3];
var secretAccessKey = process.argv[4];

var swfClient = swf.createClient({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});


var fetch_code_file = process.argv[5];
var fetch_code = require(fetch_code_file).fetch_code;


// Create the Decision task
var dt = new swf.DecisionTask(swfClient, decisionTaskConfig);

function workflowFailed(reason, details) {
   dt.fail_workflow_execution(reason, details, function(err) {
      if(err) { console.error(err); return; }
      console.log("Workflow marked as failed !");
   });
}

var workflowName = decisionTaskConfig.workflowType.name;

fetch_code(workflowName, function(err, deciderCode) {


  try {
     //console.log("Trying to load workflow : "+workflowName);
     //var workflow = require( path.join( process.cwd() , workflowName ) ).workflow;
     //console.log("workflow module loaded !");
     
     // TODO
     //var deciderCode;

     var sandbox = {
     
       just_started: dt.just_started(),
       
       schedule: function() {
         dt.schedule.apply(dt, arguments);
       },
       scheduled: function() {
         return dt.scheduled.apply(dt, arguments);
       },
       waiting_for: function() {
        dt.waiting_for.apply(dt, arguments);
       },
       completed: function() {
         return dt.completed.apply(dt, arguments);
       },
       stop: function() {
         dt.stop.apply(dt, arguments);
       },
       results: function() {
        var resultData = dt.results.apply(dt, arguments);
        try {
         var d = JSON.parse(resultData);
         return d;
        }
        catch(ex) {
          return resultData;
        }
       },
      workflow_input: function() {
        var wfInput = dt.workflow_input.apply(dt, arguments);
        try {
          var d = JSON.parse(wfInput);
          return d;
        }
        catch(ex) {
          return wfInput;
        }
      },
      log: function() {
        console.log.apply(console, ["DECIDER LOG : "].concat(arguments) );
      }
     };

     try {

        vm.runInNewContext(deciderCode, sandbox, workflowName+'.vm');

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

});
