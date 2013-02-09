var swf = require("aws-swf");

var workflow = new swf.Workflow(swfClient, {
   "domain": "test-domain",
   "workflowType": {
      "name": name,
      "version": version
   },
   "taskList": { "name": "my-workflow-tasklist" },

   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",

   "tagList": ["music purchase", "digital"],
   "childPolicy": "TERMINATE"
});


var workflowExecution = workflow.start({ input: "{}"}, function (err, runId) {

   if (err) {
      console.log("Cannot start workflow : ", err);
      return;
   }

   console.log("Workflow started, runId: " +runId);

});