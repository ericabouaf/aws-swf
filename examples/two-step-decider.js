
var swf = require('../../index'),
    config = require(__dirname + '/../../config'),
    swfClient = swf.createClient( config ),
    decisionTask = new swf.DecisionTask(swfClient, JSON.parse(process.argv[2]) );

 if( decisionTask.has_workflow_just_started() ) {
    
    decisionTask.schedule({
         "activityId": "step1",
         
         //"control":"OPTIONAL_DATA_FOR_DECIDER",
         
         "activityType":{
             "name":"hello-activity",
             "version":"1.0"
         },
         "input": "hello-activity",
         
         "taskList":{ "name":"aws-swf-tasklist" },
         
        // TODO: provde default value for these:
         "scheduleToStartTimeout":"60",
         "scheduleToCloseTimeout":"360",
         "startToCloseTimeout":"300",
         "heartbeatTimeout":"60"
         
    }, function(err, results) {
        if(err) { console.log(err, results); return; }
        console.log("Step 1 scheduled !");
    });
    
 }
 else if( decisionTask.has_completed('step1') && !decisionTask.is_scheduled('step2')  ) {
    
     decisionTask.schedule({
           "activityId": "step2",
           
           //"control":"OPTIONAL_DATA_FOR_DECIDER",
           
           "activityType":{
               "name":"hello-activity",
               "version":"1.0"
           },
           "input": "hello-activity",
           
           "taskList":{ "name":"aws-swf-tasklist" },
           
           // TODO: provde default value for these:
           "scheduleToStartTimeout":"60",
           "scheduleToCloseTimeout":"360",
           "startToCloseTimeout":"300",
           "heartbeatTimeout":"60"
           
      }, function(err, results) {
          if(err) { console.log(err, results); return; }
          console.log("Step 2 scheduled !");
      });
      
 }
 else if( decisionTask.has_completed('step2')  ) {
    
    decisionTask.CompleteWorkflowExecution("finished !", function(err, result) {
       if(err) { console.log(err); return; }
       console.log("Workflow marked as finished !");
    });
    
 }
 else {
    
    decisionTask.FailWorkflowExecution("Don't know what to do...", "more debug infos....", function(err) {
       if(err) { console.log(err); return; }
       console.log("Workflow marked as failed !");
    });
    
 }



