#!/usr/bin/env node

var colors = require('colors'),
    path = require('path'),
    optimist = require('optimist');

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
    config = require(configFilePath);
} catch (ex) {
    config = {};
}

var argv = optimist
    .usage('Start a workflow execution on AWS SWF.\nUsage: swf-start workflow-name [input data]')
    .options('d', {
        'alias' : 'domain',
        'default' : config.domain || 'aws-swf-test-domain',
        'describe': 'SWF domain'
    })
    .options('t', {
        'alias' : 'tasklist',
        'default' : config.tasklist || 'aws-swf-tasklist',
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
    .options('h', {
        'alias' : 'help',
        'describe': 'show this help'
    })
    .options('accessKeyId', {
        'default': config.accessKeyId,
        'describe': 'AWS accessKeyId'
    })
    .options('secretAccessKey', {
        'default': config.secretAccessKey,
        'describe': 'AWS secretAccessKey'
    })
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}


// Check presence of accessKeyId and secretAccessKey
if (!argv.accessKeyId || !argv.secretAccessKey) {
    console.error(("accessKeyId or secretAccessKey not configured !\nSet the --accessKeyId and --secretAccessKey parameters or call 'swf-set-credentials'.").red);
    process.exit(1);
}

if (argv._.length === 0) {
    console.error("Error: Missing workflow name !".red);
    optimist.showHelp();
    process.exit(1);
}

var swf = require('../index');
var swfClient = swf.createClient({
    accessKeyId: argv.accessKeyId,
    secretAccessKey: argv.secretAccessKey
});

var workflow = new swf.Workflow(swfClient, {
    "domain": argv.d,
    "workflowType": {
        "name": argv._[0],
        "version": String(argv.version)
    },
    "taskList": { "name": argv.t },

    "executionStartToCloseTimeout": argv.executionStartToCloseTimeout,
    "taskStartToCloseTimeout": argv.taskStartToCloseTimeout,
    "childPolicy": argv.childPolicy,

    "workflowId": argv.workflowId,

    "tagList": argv.tag ? (Array.isArray(argv.tag) ? argv.tag : [argv.tag]) : undefined
});

function startWorkflowExecution() {

    workflow.start({ input: (argv._.length > 1) ? argv._[1] : "" }, function (err, runId) {

        if (err) {
            console.error(("Error starting workflow '" + argv._[0] + "'").red);
            console.error(err);

            // Auto-registration of workflows
            var unknowType = 'Unknown type';
            if (err.__type === 'com.amazonaws.swf.base.model#UnknownResourceFault' &&  err.message.substr(0, unknowType.length) === unknowType) {

                console.log("Workflow not registered ! Registering...");
                workflow.register(function (err, results) {

                    if (err) {
                        console.error(("Error registering the workflow !").red);
                        console.error(err);
                        process.exit(1);
                    }

                    console.log("Workflow registered ! Starting...");
                    startWorkflowExecution();

                });

            } else {
                process.exit(1);
            }
            return;
        }

        console.log("Workflow started, runId: " + runId);

    });

}

startWorkflowExecution();

