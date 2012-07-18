#!/usr/bin/env node

// Start a ActivityPoller which spawns the given activity worker file

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path');
    

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
   config = require(configFilePath);
} catch(ex) {
   console.error(("Config file not found : "+configFilePath+"\nCall 'swf-set-credentials' first !").red);
   process.exit(1);
}

var argv = optimist
   .usage('Start an activity-poller for AWS SWF.\nUsage: $0 worker-file.js')
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
      'default' : 'ActivityPoller-'+os.hostname()+'-'+process.pid,
      'describe': 'identity of the poller'
   })
   .argv;


if(argv._.length === 0) {
   console.error("Error: Missing worker file !".red);
   optimist.showHelp();
   process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient( config );

// TODO: sometimes, I got "Error: socket hang up" => we should re-poll ? (todo in aws-swf)

var activityPoller = new swf.ActivityPoller(swfClient, {
   "domain": argv.d,
   "taskList": {"name": argv.t},
   "identity": argv.i
}, function(activityTask, cb) {
   
   var p = spawn('node', [ argv._[0], JSON.stringify(activityTask.config) ]);
   
   p.stdout.on('data', function (data) {
     console.log( data.toString().blue );
   });
   
   p.stderr.on('data', function (data) {
     console.log( data.toString().red );
   });
   
   p.on('exit', function (code) {
     console.log( ('child process exited with code ' + code) );
     cb(true); // continue polling  
   });
   
});

activityPoller.start();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
   
  console.log('Got SIGINT ! Stopping activity poller...');
  
  activityPoller.stop();
  process.exit(0);
});

