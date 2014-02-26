/**
 * This simple worker example will respond to any incoming task
 * on the 'my-workflow-tasklist, by setting the input parameters as the results of the task
 */

var swf = require('../index');

var activityPoller = new swf.ActivityPoller({
    domain: 'test-domain',
    taskList: { name: 'my-workflow-tasklist' },
    identity: 'simple poller ' + process.pid
});

activityPoller.on('activityTask', function(task) {
    console.log("Received new activity task !");
    var output = task.input;

    task.respondCompleted(output, function (err) {

        if(err) {
            console.log(err);
            return;
        }

        console.log("responded with some data !");
    });
});


activityPoller.on('poll', function(d) {
    console.log("polling for activity tasks...", d);
});


// Start polling
activityPoller.start();


/**
 * It is not recommanded to stop the poller in the middle of a long-polling request,
 * because SWF might schedule an ActivityTask to this poller anyway, which will obviously timeout.
 *
 * The .stop() method will wait for the end of the current polling request, 
 * eventually wait for a last activity execution, then stop properly :
 */
process.on('SIGINT', function () {
   console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
   activityPoller.stop();
});
