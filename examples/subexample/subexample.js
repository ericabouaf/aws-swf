

schedule({
   name: 'step1',
   activity: 'sleep',
   input: {
      delay: 2000
   }
});


// THIS IS A CHILD WORKFLOW !!!

start_childworkflow({
   name: 'step2',
   workflow: 'parallel-test',
   after: 'step1'
}, {
   taskStartToCloseTimeout: "3600",
   executionStartToCloseTimeout: "3600",
   childPolicy: "TERMINATE",
   taskList: {
      name: 'aws-swf-tasklist'
   }
});


stop({
   after: 'step2',
   result: function() {
      return childworkflow_results('step2').step2;
   }
});

