var swf = require('../index');

var myDecider = new swf.Decider({
   "domain": "test-domain",
   "taskList": {"name": "my-workflow-tasklist"},
   "identity": "Decider-01",
   "maximumPageSize": 100,
   "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
});

myDecider.on('decisionTask', function (decisionTask) {

    console.log("Got a new decision task !");

    if(!decisionTask.eventList.scheduled('step1')) {
        decisionTask.response.schedule({
            name: 'step1',
            activity: 'simple-activity'
        });
    }
    else {
        decisionTask.response.stop({
          result: "some workflow output data"
        });
    }

    decisionTask.response.respondCompleted(decisionTask.response.decisions, function(err, result) {

      if(err) {
          console.log(err);
          return;
      }

      console.log("responded with some data !");
    });

});

myDecider.on('poll', function(d) {
    //console.log(_this.config.identity + ": polling for decision tasks...");
    console.log("polling for tasks...", d);
});

// Start polling
myDecider.start();



/**
 * It is not recommanded to stop the poller in the middle of a long-polling request,
 * because SWF might schedule an DecisionTask to this poller anyway, which will obviously timeout.
 *
 * The .stopHandler() method will wait for the end of the current polling request,
 * eventually wait for a last decision execution, then stop properly :
 */
process.on('SIGINT', myDecider.stopHandler);
process.on('SIGTERM', myDecider.stopHandler);
