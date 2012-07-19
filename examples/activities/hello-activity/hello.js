var nodemailer = require("nodemailer");

var gmailAuth = require('./config');

exports.worker = function(taskConfig) {
   
   console.log("task input: "+taskConfig.input);
   
   var input = JSON.parse(taskConfig.input);
   
   var swf = require('../../../index'),
       swfClient = swf.createClient(),
       task = new swf.ActivityTask(swfClient, taskConfig );
   
   
    // create reusable transport method (opens pool of SMTP connections)
      var smtpTransport = nodemailer.createTransport("SMTP",{
          service: "Gmail",
          auth: gmailAuth
      });

      // setup e-mail data with unicode symbols
      var mailOptions = input;
      
      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function(err, response){
         
          if(err) { 
             
             task.respondFailed(err, "", function(err) {
                 if(err) { console.error(err); return; }
                 console.log("hello: respondFailed");
              });
              
             return; 
         }
          
          console.log("email worker sent: " + response.message);
          
          smtpTransport.close();
          var result = JSON.stringify({message: response.message});

          task.respondCompleted(result, function(err) {
             if(err) { console.error(err); return; }
             console.log("hello: respondComplete");
          });

          
      });
      
};

