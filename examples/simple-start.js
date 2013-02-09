
var swf = require('../index');

var workflow = new swf.Workflow({
   "domain": "test-domain",
   "workflowType": {
      "name": "simple-workflow",
      "version": "1.0"
   },
   "taskList": { "name": "my-workflow-tasklist" },
   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",
   "tagList": ["example"],
   "childPolicy": "TERMINATE"
});


var workflowExecution = workflow.start({ input: "any data ..."}, function (err, runId) {

   if (err) { console.log("Cannot start workflow : ", err); return; }

   console.log("Workflow started, runId: " +runId);

});