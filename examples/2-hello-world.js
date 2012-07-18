var swf = require("../index");
var swfClient = swf.createClient();

/* Start the ActivityPoller */
var helloActivityPoller = new swf.ActivityPoller(swfClient, {
   "domain": "node-swf-examples",
   "taskList": { "name": "helloTasks" },
   "identity": "helloActivityPoller-01"
}, function(activityTask, cb) {
   
   activityTask.respondCompleted("this is hello world results", function(err, result) {
      console.log("results sent !");
   });
   
   cb(true);
});

helloActivityPoller.start();

/* Start the Decider */
var helloDecider = new swf.Decider(swfClient, {
   "domain": "node-swf-examples",
   "taskList": { "name": "helloTasks" },
   "identity": "Decider01",
   "maximumPageSize": 500,
   "reverseOrder": true
}, function(decisionTask, cb) {
   
   if(decisionTask.config.events.length > 20) {
      decisionTask.complete_workflow_execution("results here...", function(err, result) {
         cb(true);
      });
   }
   else {
      decisionTask.schedule({
         "activityId": (Math.random()+"").substr(2),
         "activityType":{
            "name":"hello-activity",
            "version":"1.0"
         },
         "taskList":{ "name":"helloTasks" },
         "input": "hello-activity",
                    
         "scheduleToCloseTimeout":"360",
         "scheduleToStartTimeout":"60",
         "startToCloseTimeout":"300",
         "heartbeatTimeout":"60"
      });
  }
   
});

/* Start the Workflow */
var helloWorldWorkflow = new swf.Workflow(swfClient, {
   "domain": "node-swf-examples",
   "workflowType": { "name": "hello-workflow", "version": "1.0" },
   "taskList": { "name": "helloTasks" },
   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",
   "childPolicy": "TERMINATE"
});

helloWorldWorkflow.start({
   input: "arbitrary-string-that-is-meaningful-to-the-workflow"
}, function(err, runId) {
   
   if(err) {
      console.error("Cannot start workflow : ", err);
      return;
   }
   
   console.log("helloWorldWorkflow started, runId="+runId);
   
});

