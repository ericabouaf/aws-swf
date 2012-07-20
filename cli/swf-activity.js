#!/usr/bin/env node

// Start a ActivityPoller which spawns the given activity worker file

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
   .usage('Start an activity-poller for AWS SWF.\nUsage: swf-activity worker-file.js')
   .options('f', {
      'alias' : 'file',
      'default' : path.join(__dirname, 'activity-worker.js'),
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
      'default' : 'ActivityPoller-'+os.hostname()+'-'+process.pid,
      'describe': 'identity of the poller'
   })
   .argv;

// check if file exists !
if( !(process.version.substr(1,3) == "0.6" ? path : fs).existsSync(argv.f) ) {
   console.error( ("File does not exist : "+argv.f ).red );
   process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient( config );

var activityPoller = new swf.ActivityPoller(swfClient, {
   "domain": argv.d,
   "taskList": {"name": argv.t},
   "identity": argv.i
}, function(activityTask, cb) {
   
   // Spawn child process
   var p = spawn('node', [ argv.f, JSON.stringify(activityTask.config) ]);
   
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
   console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
   activityPoller.stop();
});

