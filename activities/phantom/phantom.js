
// TODO: add method to close the phantomJS session properly

var dnode = require('dnode');

exports.worker = function (task, config) {

   var input = JSON.parse(task.config.input);

   var d = dnode.connect(5004);
   d.on('remote', function (remote) {
       
       if(input.create) {
          remote.createInstance(input.url, function (err, instanceId) {
               d.end();

               task.respondCompleted({instanceId: instanceId});
           });
       }
       else {
           remote.evaluate(input.instanceId, input.fnString, function (err, results) {
               d.end();

               task.respondCompleted({results: results});
           });
       }
       
   });
   
   
};

