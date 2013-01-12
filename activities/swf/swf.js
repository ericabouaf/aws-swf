
var AWS = require('aws-sdk');


function makeFct(name) {

   return function (task, config) {

      AWS.config.update({
         accessKeyId: config.accessKeyId,
         secretAccessKey: config.secretAccessKey,
         region: config.region
      });

      var params = JSON.parse(task.config.input);

      var svc = new AWS.SimpleWorkflow();

      svc.client[name](params, function (err, data) {
         if (err) {
            console.log(err); // an error occurred
            task.respondFailed('Error during the SimpleWorkflow call', err);

         } else {
            // successful response
            // console.log( JSON.stringify(data, null, 3) );
            task.respondCompleted(data);
         }
      });

   };

}

[
   "countClosedWorkflowExecutions",
   "countOpenWorkflowExecutions",
   "countPendingActivityTasks",
   "countPendingDecisionTasks",
   "deprecateActivityType",
   "deprecateDomain",
   "deprecateWorkflowType",
   "describeActivityType",
   "describeDomain",
   "describeWorkflowExecution",
   "describeWorkflowType",
   "getWorkflowExecutionHistory",
   "listActivityTypes",
   "listClosedWorkflowExecutions",
   "listDomains",
   "listOpenWorkflowExecutions",
   "listWorkflowTypes",
   "pollForActivityTask",
   "pollForDecisionTask",
   "recordActivityTaskHeartbeat",
   "registerActivityType",
   "registerDomain",
   "registerWorkflowType",
   "requestCancelWorkflowExecution",
   "respondActivityTaskCanceled",
   "respondActivityTaskCompleted",
   "respondActivityTaskFailed",
   "respondDecisionTaskCompleted",
   "signalWorkflowExecution",
   "startWorkflowExecution",
   "terminateWorkflowExecution"
].forEach(function(n) {
   exports[n] = makeFct(n);
});
