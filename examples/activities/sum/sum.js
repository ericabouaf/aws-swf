var nodemailer = require("nodemailer");

exports.worker = function(taskConfig) {
   
   var input = JSON.parse(taskConfig.input);
   
   var swf = require('../../../index'),
       swfClient = swf.createClient(),
       task = new swf.ActivityTask(swfClient, taskConfig );
   
   console.log("Return"+(input.a+input.b));
   
    task.respondCompleted(input.a+input.b, function(err) {
       if(err) { console.error(err); return; }
       console.log("hello: respondComplete");
    });
    
};

