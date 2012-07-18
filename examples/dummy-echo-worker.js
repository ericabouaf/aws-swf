
// Dummy worker example : echo the task input as task result

var swf = require('../index'),
    swfClient = swf.createClient(),
    task = new swf.ActivityTask(swfClient, JSON.parse(process.argv[2]) );

console.log("Starting dummy-echo-task: "+task.config.activityType.name+' version '+task.config.activityType.version);

var result = task.input;

task.respondCompleted(result, function(err) {
   if(err) { console.error(err); return; }
   console.log("dummy-echo-task: result sent");
});
