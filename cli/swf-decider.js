#!/usr/bin/env node

var argv = require('optimist')
    .usage('Start a decider-poller for AWS SWF.\nUsage: $0')
    
    .demand('f')
    .alias('f', 'file')
    .describe('f', 'file to spawn for each new decision task')
    
    .default('i', 'Decider-'+process.pid) // TODO: process.hostname+'-'+process.pid
    .alias('i', 'identity')
    .describe('i', 'identity of the poller')
     
    .default('d', 'test-domain')
    .alias('d', 'domain')
    .describe('d', 'SWF domain')
    
    .default('t', 'SAME_AS_DECIDER')
    .alias('t', 'tasklist')
    .describe('t', 'tasklist')
    
    .argv
;

var swf = require('../index');
var awsCredentials = require(__dirname + "/../config");
var swfClient = swf.createClient( awsCredentials );

var spawn = require('child_process').spawn,
    colors = require('colors');

var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/../config/' + env + '.js');
var swfClient = swf.createClient( config.awsCredentials );


var myDecider = new swf.Decider(swfClient, {
   "domain": argv.d,
   "taskList": {"name": argv.t},
   "identity": arg.i,
   "maximumPageSize": 500,
   "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
}, function(decisionTask, cb) {
   
   // spawn decider.js
   var p = spawn('node', [ __dirname+'/decider.js', JSON.stringify(decisionTask.config) ]);
   
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
   
  console.log('Got SIGINT ! Stopping decider poller...');
  
  myDecider.stop();
  process.exit(0);
});
