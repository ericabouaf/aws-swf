#!/usr/bin/env node

var colors = require('colors'),
    optimist = require('optimist'),
    path = require('path');
    

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
   config = require(configFilePath);
} catch(ex) {
   console.error(("Config file not found : "+configFilePath+"\nCall 'swf-set-credentials' first !").red);
   process.exit(1);
}

// TODO: if no resource name given, register workflows and activities in the working directory

var argv = optimist
   .usage('Register a new activity-type, workflow or domain on AWS SWF.\nUsage: swf-register resource-name')
   .options('k', {
      'alias' : 'kind',
      'default' : 'activity',
      'describe': 'Kind of resource to register. "activity", "workflow", or "domain"',
      'check': function(value) {
         return (value == 'activity') || (value == 'workflow') || (value == 'domain');
      }
   })
   .options('d', {
      'alias' : 'domain',
      'default' : config.domain,
      'describe': 'SWF domain of the activity-type or workflow to register'
   })
   .options('v', {
      'alias' : 'version',
      'default' : '1.0',
      'describe': 'version of the activity-type or workflow to register'
   })
   .argv;


if(argv._.length === 0) {
   console.error("Error: Missing resource name !".red);
   optimist.showHelp();
   process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient( config );

var action, params;

if(argv.k == "activity") {
   action = "RegisterActivityType";
   params = {
      "name": argv._[0],
      "domain": argv.d,
      "version": argv.v
   };
}
else if(argv.k == "workflow") {
   action = "RegisterWorkflowType";
   params = {
        "name": argv._[0],
        "domain": argv.d,
        "version": argv.v
     };
}
else if(argv.k == "domain") {
   action = "RegisterDomain";
   params = {
      "name": argv._[0],
      "description": "no description",
      "workflowExecutionRetentionPeriodInDays": "1"
   };
}


swfClient.call(action,  params, function(err, results) {

   if(err) {
      console.error( ("Error in "+action).red );
      console.error(err);
      process.exit(1);
   }
   
   console.log(action+" OK !");
   console.log("results: ", results);

});
