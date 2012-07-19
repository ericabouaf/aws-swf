//
// Default worker process
//
// Activity-worker is used by the swf-activity command to launch the worker in a spawed process
//
//

var path = require('path');

var taskConfig = JSON.parse(process.argv[2]); // TODO: try/catch ?

var workerName = taskConfig.activityType.name;

try {
   console.log("Trying to load worker : "+workerName);
   var worker = require( path.join( process.cwd() , workerName ) ).worker;
   console.log("module loaded !");
   
   try {
      worker( taskConfig );
   }
   catch(ex) {
      
      console.log(ex);
      
      var swf = require('../index'),
          swfClient = swf.createClient(),
          task = new swf.ActivityTask(swfClient, taskConfig );
      
      task.respondFailed("Error executing "+workerName, "", function(err) {
         if(err) { console.error(err); return; }
         console.log("respond failed !");
      });
      
   }
   
}
catch(ex) {
   
   console.log(ex);
   
   var swf = require('../index'),
       swfClient = swf.createClient(),
       task = new swf.ActivityTask(swfClient, taskConfig );
   
   task.respondFailed("Unable to load module "+workerName, "", function(err) {
      if(err) { console.error(err); return; }
      console.log("respond failed !");
   });
   
   
}