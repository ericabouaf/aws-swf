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

        // We must poll again
        activityPoller.poll();
    });
});


activityPoller.on('poll', function(d) {
    console.log("polling for activity tasks...", d);
});


// Start polling
activityPoller.poll();
