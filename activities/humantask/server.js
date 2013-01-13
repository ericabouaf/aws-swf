/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express'),
    fs = require('fs'),
    dynamo = require("dynamo"),
    mu = require('mu2'),
    fs = require('fs'),
    ejs = require('ejs'),
    querystring = require('querystring');


var app = express();

// Load configurations
app.config = require('./config.js');

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');

// DynamoDB connection
var client = dynamo.createClient(app.config.awsCredentials), 
    db = client.get('us-east-1');

app.db = db;


function taskFromToken(req, res, next) {
  // TODO: make task retrieve as middleware
  app.db.get("Task")
    .scan({taskToken: req.param('taskToken') })
    .get("taskToken", "activityId", "startedEventId", "input", "workflowExecution", "activityType", "userId")
    .fetch(function(err, tasks){
     
     if(err) {
        console.log(err);
        // TODO
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
  res.render('humantasks/finished', { 
     layout: 'humantasks/task-layout',
     locals: { 
        taskToken: "",
        action: "humantasks"
     }
  });
});


/**
* Display an activity
*/
app.get('/activity/:taskToken', taskFromToken, function(req, res) {
  
  // TODO: check if task has not timed-out (should be "STARTED")
  
  var activityTask = req.task;
  var input = JSON.parse(activityTask.input);
     
  if(input.template) {
      
      var stream = mu.renderText(input.template, input, {});

      var str = "";
      stream.on('data', function(data) { str += data; });
      stream.on('end', function() {
            
         fs.readFile(__dirname+'/app/views/task-layout.ejs', 'utf-8', function(error, content) {
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
           activityTask: activityTask, 
           action: "humantasks" 
        } 
     });
  }   
  
});


/**
* Webservices to complete or fail an activity task
*/
app.post('/:taskToken/completed', taskFromToken, function(req, res){
  
  var activityTask = req.task;
     
  app.User.find({
    id: activityTask.userId
  }, function(err, users) {
        
     var user = users[0];
     var swfClient = swf.createClient({
        accessKeyId: user.accessKeyId,
        secretAccessKey: user.secretAccessKey
     });
        
     // send a RespondActivityTaskCompleted
     swfClient.call("RespondActivityTaskCompleted",  {
        "taskToken": req.param('taskToken'),
        "result": JSON.stringify( req.body )
     }, function(err, result) {
           
        if(err) {

           // TODO: delete task
           var taskItem = app.db.get("Task").get( {taskToken: req.param('taskToken') } ).destroy(function(err) {
              
              res.render('humantasks/error', { 
                layout: 'humantasks/task-layout', 
                locals: { 
                   error: err,
                   activityTask: null,
                   taskToken: "no",
                   action: "humantasks" 
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
