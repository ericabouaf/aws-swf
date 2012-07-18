#!/usr/bin/env node

var argv = require('optimist')
    .usage('Start a workflow on AWS Simple Workflow (SWF).\nUsage: $0')
    
    .demand('w')
    .alias('w', 'workflow')
    .describe('w', 'name of the workflow to start')
     
    .default('d', 'test-domain')
    .alias('d', 'domain')
    .describe('d', 'SWF domain')
    
    .default('v', '1.0')
    .alias('v', 'version')
    .describe('v', 'version of the workflow to start')
    
    
    .default('t', 'SAME_AS_DECIDER')
    .alias('t', 'tasklist')
    .describe('t', 'tasklist')
    .argv
;

var swf = require('../index');
var awsCredentials = require(__dirname + "/../config");
var swfClient = swf.createClient( awsCredentials );

var workflow = new swf.Workflow(swfClient, {
   "domain": argv.d,
   "workflowType": {
      "name": argv.w,
      "version": argv.version
   },
   "taskList": { "name": argv.t },
   
   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",
   
   //"tagList": ["music purchase", "digital", "ricoh-the-dog"],
   "childPolicy": "TERMINATE"
});


var workflowExecution = workflow.start({ input: "{}"}, function(err, runId) {
   
   if(err) {
      console.log("Cannot start workflow : ", err);
      process.exit(1);
   }
   
   console.log("Workflow started, runId: "+runId);
   
});

