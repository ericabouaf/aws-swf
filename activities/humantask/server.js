/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express'),
    fs = require('fs'),
    dynamo = require("dynamo"),
    mu = require('mu2'),
    fs = require('fs'),
    ejs = require('ejs'),
    querystring = require('querystring'),
    expressLayouts = require('express-ejs-layouts'),
    AWS = require('aws-sdk');

var app = express();

// Load configurations
app.config = require('./config.js');

app.configure(function(){
   app.use(express.static(__dirname + '/public'));
   app.set('views', __dirname + '/app/views');
   app.set('view engine', 'ejs');
   app.set('layout', 'layout'); // defaults to 'layout'     
   app.use(expressLayouts);
   app.use(express.bodyParser());
});


// DynamoDB connection
var client = dynamo.createClient(app.config.awsCredentials), 
    db = client.get('us-east-1');

app.db = db;


function taskFromToken(req, res, next) {
   app.db.get("Task")
      .scan({taskToken: req.param('taskToken') })
      .get("taskToken", "activityId", "startedEventId", "input", "workflowExecution", "activityType")
      .fetch(function(err, tasks){
      
      if(err) {
         res.render('error', { 
            locals: { 
               error: err
            } 
         });
         return;
      }
      req.task = tasks[0];
      next();
   });
}

/**
 * Task finished
 */
app.get('/finished', function(req, res) {
   res.render('finished', { 
      locals: { 
         taskToken: ""
      }
   });
});


/**
 * Display an activity
 */
app.get('/activity/:taskToken', taskFromToken, function(req, res) {
  
   if(!req.task) {
      res.render('unavailable', { 
         locals: { 
            taskToken: ""
         }
      });
      return;
   }

   // TODO: check if task has not timed-out (should be "STARTED")
  
   var activityTask = req.task;
   var input = JSON.parse(activityTask.input);
     
   if(input.template) {
      
      var stream = mu.renderText(input.template, input, {});

      var str = "";
      stream.on('data', function(data) { str += data; });
      stream.on('end', function() {
         fs.readFile(__dirname+'/app/views/layout.ejs', 'utf-8', function(error, content) {
            res.set('Content-Type', 'text/html');
            var body = ejs.render(content, {
               body: str,
               taskToken: querystring.escape(activityTask.taskToken)
            });
            res.send(body);
         });
      });
        
   }
   else {
      // Render the default task view
      res.render('defaultTaskView', {
         locals: { 
            taskToken: querystring.escape(activityTask.taskToken), 
            activityTask: activityTask
         } 
      });
   }   
  
});


/**
 * Webservices to complete or fail an activity task
 */
app.post('/:taskToken/completed', taskFromToken, function(req, res){
  
   var activityTask = req.task;
  
   AWS.config.update({
      accessKeyId: app.config.awsCredentials.accessKeyId,
      secretAccessKey: app.config.awsCredentials.secretAccessKey,
      region: app.config.region
   });
     
   // send a RespondActivityTaskCompleted
   var svc = new AWS.SimpleWorkflow();
   svc.client.respondActivityTaskCompleted({
      "taskToken": req.param('taskToken'),
      "result": JSON.stringify( req.body )
   }, function (awsErr, result) {

      if(awsErr) {
         console.log("respondActivityTaskCompleted failed : ", awsErr);
         console.log("respondActivityTaskCompleted failed : ", JSON.stringify( req.body ));
         // TODO: delete task
         var taskItem = app.db.get("Task").get( {taskToken: req.param('taskToken') } ).destroy(function(err) {
           
            res.render('error', { 
               locals: { 
                  error: awsErr,
                  activityTask: null,
                  taskToken: "no"
               } 
            });
         });
        
         return;
      }
        
      // Delete the activity
      var taskItem = app.db.get("Task").get( {taskToken: req.param('taskToken') } ).destroy(function(err) {
         if (err) { console.error(err); }
         res.redirect('/finished');
      });
        
   });
});

app.post('/:taskToken/canceled', taskFromToken, function(req, res){
   // TODO: send a RespondActivityTaskCanceled
   // TODO: delete the activity
   res.send('Hello World');
});

app.post('/:taskToken/failed', taskFromToken, function(req, res){
   // TODO: send a RespondActivityTaskFailed
   // TODO: delete the activity
   res.send('Hello World');
});


// start the server
app.listen(app.config.server.port, app.config.server.ip);

console.log("App started in '"+app.set('env')+"' environment !\n" +
            "Listening on http://"+app.config.server.host+":"+app.config.server.port);
