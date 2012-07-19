
exports.worker = function(task) {
   
   var result = task.config.input; // yes, echo is pretty dumb....
   
   task.respondCompleted(result, function(err) {
      if(err) { console.error(err); return; }
      console.log("echo: respondComplete");
   });
   
};

