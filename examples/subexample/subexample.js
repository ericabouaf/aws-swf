

sleep({
   name: 'step1'
}, { 
   input: {
      delay: 2000
   }
});


// THIS IS A CHILD WORKFLOW !!!

if( completed('step1') && !childworkflow_scheduled('step2') ) {

  start_childworkflow({

    control: 'step2',

    taskStartToCloseTimeout: "3600",
    executionStartToCloseTimeout: "3600",
    childPolicy: "TERMINATE",

    workflowType: {
      name: "parallel-test",
      version: "1.0"
    },
    taskList: {
      name: 'aws-swf-tasklist'
    }
  });

}

if( !childworkflow_completed('step2') ) {
  waiting_for();
}
else {
  stop({}, 'Everything is good !');
}
