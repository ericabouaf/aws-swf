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
   .usage('Start a workflow execution on AWS SWF.\nUsage: swf-start workflow-name [input data]')
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
   .options('i', {
      'alias' : 'workflowId',
      'describe': 'user defined identifier associated with the workflow execution'
   })
   .options('executionStartToCloseTimeout', {
      'default' : '1800', // 30 minutes
      'describe': 'executionStartToCloseTimeout in seconds'
   })
   .options('taskStartToCloseTimeout', {
      'default' : '1800', // 30 minutes
      'describe': 'taskStartToCloseTimeout in seconds'
   })
   .options('childPolicy', {
      'default' : 'TERMINATE',
      'describe': 'childPolicy'
   })
   .options('tag', {
      'describe': 'tag to add to this workflow execution. Can have multiple.'
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
   
   "executionStartToCloseTimeout": argv.executionStartToCloseTimeout,
   "taskStartToCloseTimeout": argv.taskStartToCloseTimeout,
   "childPolicy": argv.childPolicy,
   
   "workflowId": argv.workflowId,
   
   "tagList": argv.tag ? ( Array.isArray(argv.tag) ? argv.tag : [argv.tag] ) : undefined
});

function startWorkflowExecution() {

   workflow.start({ input: (argv._.length > 1) ? argv._[1] : "" }, function(err, runId) {
   
      if(err) {
         console.error( ("Error starting workflow '"+argv._[0]+"'").red );
         console.error(err);
         
         // Auto-registration of workflows
         var unknowType = 'Unknown type';
         if(err.__type == 'com.amazonaws.swf.base.model#UnknownResourceFault' &&  err.message.substr(0,unknowType.length) == unknowType) {
            
            console.log("Workflow not registered ! Registering...");
            workflow.register(function(err, results) {
              
               if(err) {
                  console.error( ("Error registering the workflow !").red );
                  console.error(err);
                  process.exit(1);
               }
               
               console.log("Workflow registered ! Starting...");
               startWorkflowExecution();
               
            });
         
         }
         else {
            process.exit(1);
         }
         return;
      }
      
      console.log("Workflow started, runId: "+runId);
      
   });

}

startWorkflowExecution();
