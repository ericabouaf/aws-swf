var nodemailer = require('nodemailer'),
    dynamo = require('dynamo'),
    querystring = require('querystring');


function sendNotification(notification, taskToken, config) {

   var smtpTransport = nodemailer.createTransport("SMTP", config.mailer_transport);
   
   var mailOptions = {

      from: notification.from || config.defaultNotification.from,
      to: notification.to || config.defaultNotification.to,
      subject: notification.subject || config.defaultNotification.subject,


      text: "Hello world",
      html: "New task : <a href='http://" + config.server.host + ":" + config.server.port + "/activity/"+querystring.escape(taskToken)+"'>Click here to do the task !</a>"
   };
   
   // send mail with defined transport object
   smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
         console.log(error);
      } else {
         console.log("HUMANTASK WORKER email notification sent: " + response.message);
      }
      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
   });

}


exports.worker = function (task, config) {

   var input = JSON.parse(task.config.input);

   var client = dynamo.createClient(config.awsCredentials);
   var db = client.get("us-east-1"); // TODO: in config

   // insert the task in DynamoDB
   var o = {};
   for(var k in task.config) {
      if( typeof task.config[k] == "string" ) {
         o[k] = { S: task.config[k] };
      }
      /*else if(k == "activityType") {
         o[k] = { S: task.config[k].name };
      }*/
      else {
         o[k] = { S: JSON.stringify(task.config[k]) };
      }
   }

   db.putItem({
      TableName: "Task",
      Item: o
   }, function(err, data) {
      
      if(err) {
         console.log(err);
         task.respondFailed(err, "");
         return;
      }
      
      // Send email notification
      if(input["email-notification"] || config.defaultNotification) {
         sendNotification(input["email-notification"] ||  {}, task.config.taskToken, config);
      }
      
   });
   
};
