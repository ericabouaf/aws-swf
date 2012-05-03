var swf = require("../index");

var awsCredentials = require("./config");
var swfClient = swf.createClient( awsCredentials );


var helloActivityPoller = new swf.ActivityPoller(swfClient, {
   
   "domain": "node-swf-examples",
   "taskList": { "name": "helloTasks" },
   "identity": "helloActivityPoller-01"
   
}, function(activityTask, cb) {
   
   console.log("Hello world !");
   
   activityTask.respondCompleted("this is hello world results", function() {
      // optional callback
      console.log("results sent !");
   });
   
   cb(true);
   
});

helloActivityPoller.start();




var helloDecider = new swf.Decider(swfClient, {
   "domain": "node-swf-examples",
   "taskList": {
      "name": "helloTasks"
   },
   "identity": "Decider01",
   "maximumPageSize": 500,
   "reverseOrder": true
}, function(decisionTask, cb) {
   
   if(decisionTask.config.events.length > 20) {
      decisionTask.CompleteWorkflowExecution();
   }
   else {
      // Return decisions
   
      decisionTask.respondCompleted([
            {
                "decisionType":"ScheduleActivityTask",
                "scheduleActivityTaskDecisionAttributes":{
                    "control":"OPTIONAL_DATA_FOR_DECIDER",
                    "activityType":{
                        "name":"hello-activity",
                        "version":"1.0"
                    },
                    "activityId": (Math.random()+"").substr(2),
                    "scheduleToCloseTimeout":"360",
                    "taskList":{
                        "name":"helloTasks"
                    },
                    "scheduleToStartTimeout":"60",
                    "startToCloseTimeout":"300",
                    "heartbeatTimeout":"60",
                    "input": "hello-activity"
                }
            }
        ]);
     }
   
   cb(true);
   
});


var helloWorldWorkflow = new swf.Workflow(swfClient, {
   "domain": "node-swf-examples",
   "workflowType": {
      "name": "hello-workflow",
      "version": "1.0"
   },
   "taskList": { "name": "helloTasks" },
   
   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",
   
   "tagList": ["music purchase", "digital", "ricoh-the-dog"],
   "childPolicy": "TERMINATE"
});

helloWorldWorkflow.start({
   input: "arbitrary-string-that-is-meaningful-to-the-workflow"
}, function(err, runId) {
   
   if(err) {
      console.log("Cannot start workflow : ", err);
      return;
   }
   
   console.log("helloWorldWorkflow started, runId="+runId);
   
});

