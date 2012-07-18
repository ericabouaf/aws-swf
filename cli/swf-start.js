#!/usr/bin/env node

var colors = require('colors'),
    path = require('path'),
    optimist = require('optimist');

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
   config = require(configFilePath);
} catch(ex) {
   console.error(("Config file not found : "+configFilePath+"\nCall 'swf-set-credentials' first !").red);
   process.exit(1);
}

var argv = optimist
   .usage('Start a workflow on AWS SWF.\nUsage: $0 workflow-name')
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
   .options('v', {
      'alias' : 'version',
      'default' : '1.0',
      'describe': 'version of the workflow to start'
   })
   .argv;

if(argv._.length === 0) {
   console.error("Error: Missing workflow name !".red);
   optimist.showHelp();
   process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient( config );

var workflow = new swf.Workflow(swfClient, {
   "domain": argv.d,
   "workflowType": {
      "name": argv._[0],
      "version": argv.version+""
   },
   "taskList": { "name": argv.t },
   
   
   // TODO: provide optional value for these:
   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",
   
   //"tagList": ["music purchase", "digital", "ricoh-the-dog"],
   "childPolicy": "TERMINATE"
});


var workflowExecution = workflow.start({ input: "{}"}, function(err, runId) { // TODO: configurable input !
   
   if(err) {
      console.error( ("Error starting workflow '"+argv._[0]+"'").red );
      console.error(err);
      process.exit(1);
   }
   
   console.log("Workflow started, runId: "+runId);
   
});

