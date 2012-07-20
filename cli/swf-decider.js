#!/usr/bin/env node

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path'),
    fs = require('fs');
    
var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
   config = require(configFilePath);
} catch(ex) {
   console.error(("Config file not found : "+configFilePath+"\nCall 'swf-set-credentials' first !").red);
   process.exit(1);
}


var argv = optimist
   .usage('Start a decider-poller for AWS SWF.\nUsage: swf-decider decider-file.js')
   .options('f', {
      'alias' : 'file',
      'default' : path.join(__dirname, 'decider-worker.js'),
      'describe': 'file to execute in a node spawed process'
   })
   .options('d', {
      'alias' : 'domain',
      'default' : config.domain,
      'describe': 'SWF domain'
   }) 
   .options('t', {
      'alias' : 'tasklist',
      'default' : config.tasklist,
      'describe': 'tasklist'
   })
   .options('i', {
      'alias' : 'identity',
      'default' : 'Decider-'+os.hostname()+'-'+process.pid,
      'describe': 'identity of the poller'
   })
   .options('h', {
      'alias' : 'help',
      'describe': 'show this help'
   })
   .argv;

if(argv.help) {
   optimist.showHelp();
   process.exit(0);
}

// check if file exists !
if( !(process.version.substr(1,3) == "0.6" ? path : fs).existsSync(argv.f) ) {
   console.error( ("File does not exist : "+argv.f ).red );
   process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient( config );

var myDecider = new swf.Decider(swfClient, {
   "domain": argv.d,
   "taskList": {"name": argv.t},
   "identity": argv.i,
   "maximumPageSize": 500,
   "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
}, function(decisionTask, cb) {
   
   // If we receive an event "ScheduleActivityTaskFailed", we should fail the workflow and display why...
   var failedEvent = decisionTask.has_schedule_activity_task_failed(); 
   if( failedEvent ) {
      var failedAttrs = failedEvent.scheduleActivityTaskFailedEventAttributes;
      console.error( ("Received a ScheduleActivityTaskFailed: "+failedAttrs.cause+"  "+JSON.stringify(failedAttrs)).red );
      decisionTask.fail_workflow_execution(failedAttrs.cause, JSON.stringify(failedAttrs), function(err, results) {
          if(err) { console.log(err, results); return; }
          console.error("Workflow marked as failed !".red);
      });
      cb(true); // to continue polling
      return;
   }
   
   // Spawn child process
   var p = spawn('node', [ argv.f, JSON.stringify(decisionTask.config) ]);
   
   p.stdout.on('data', function (data) {
     console.log( data.toString().blue );
   });

   p.stderr.on('data', function (data) {
     console.log( data.toString().red );
   });

   p.on('exit', function (code) {
     console.log( ('child process exited with code ' + code) );
     cb(true); // to continue polling
   });
   
});

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
   console.log('Got SIGINT ! Stopping decider poller after this request...please wait...');
   myDecider.stop();
});
