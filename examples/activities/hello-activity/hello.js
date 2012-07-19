var nodemailer = require("nodemailer");

var gmailAuth = require('./config');

exports.worker = function(task) {
   
   console.log("Task input : ", task.config.input);
   
   var input = JSON.parse(task.config.input);
   
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

