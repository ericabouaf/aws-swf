
// Simple worker example : echo every task input as result (do nothing except passing the arguments)

var swf = require('../../index'),
    config = require(__dirname + '/../../config'),
    swfClient = swf.createClient( config ),
    task = new swf.ActivityTask(swfClient, JSON.parse(process.argv[2]) );

console.log("Received new task: "+task.config.activityType.name+' version '+task.config.activityType.version);

var result = task.input;

task.respondCompleted(result, function(err) {
   
   if(err) {
      console.log(err);
      return;
   }
   
   console.log("Sent results ");
});
