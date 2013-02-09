var swf = require("aws-swf");

var myDecider = new swf.Decider(swfClient, {
    
   "domain": "test-domain",
   "taskList": {"name": "my-workflow-tasklist"},
   "identity": "Decider-01",
   
   "maximumPageSize": 500,
   "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
   
}, function (decisionTask, cb) {
    
    // do something here and send decisions...

    if(!dt.scheduled('step1')) {

        dt.schedule({
            name: 'step1',
            activity: 'simple-activity'
        });

    }
    else {
        decisionTask.complete_workflow_execution("details of ending here ?", function (err) {
        });    
    }
    
    
    cb(true); // to continue polling
});