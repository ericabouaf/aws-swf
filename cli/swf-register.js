#!/usr/bin/env node

var colors = require('colors'),
    optimist = require('optimist'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
    config = require(configFilePath);
} catch (ex) {
    config = {};
}

var argv = optimist
    .usage('Register a new activity-type, workflow or domain on AWS SWF.\nUsage: swf-register resource-name')
    .options('k', {
        'alias' : 'kind',
        'default' : 'activity',
        'describe': 'Kind of resource to register. "activity", "workflow", or "domain"'
    })
    .check(function (value) {
        return (value.k === 'activity') || (value.k === 'workflow') || (value.k === 'domain');
    })
    .options('d', {
        'alias' : 'domain',
        'default' : config.domain || 'aws-swf-test-domain',
        'describe': 'SWF domain of the activity-type or workflow to register'
    })
    .options('v', {
        'alias' : 'version',
        'default' : '1.0',
        'describe': 'version of the activity-type or workflow to register'
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

var swf = require('../index');
var swfClient = swf.createClient(config);


var registerWorkflows = function (toRegister) {

    var registerAT = function (a, callback) {
        console.log("registering Workflow : ", a, argv.version);

        swfClient.client.registerWorkflowType({
            domain: argv.domain,
            name: a,
            version: argv.version
        }, function (err, results) {
            if (err) { console.log("err: ", err); }
            //console.log("RegisterActivityType results: ", results);
            callback();
        });
    };

    async.map(toRegister, registerAT, function (err) {
        if (err) {
            console.log(err);
        }
    });

};


var registerMissingWorkflows = function (workflowsToRegister) {

    swfClient.client.listWorkflowTypes({
        domain: argv.domain,
        registrationStatus: "REGISTERED",
        maximumPageSize: 500
    }, function (err, registeredWorkflows) {
        if (err) {
            console.log("error", err);
            return;
        }

        registeredWorkflows = registeredWorkflows.typeInfos.map(function (w) {
            return w.workflowType.name + '-v' + w.workflowType.version;
        });

        var toRegister = [];

        workflowsToRegister.forEach(function (a) {
            if (registeredWorkflows.indexOf(a + '-v' + argv.version) === -1) {
                console.log("Workflow " + a + " not registered yet !");
                toRegister.push(a);
            } else {
                console.log("Workflow " + a + " already registered !");
            }
        });

        if (toRegister.length > 0) {
            registerWorkflows(toRegister);
        }

    });

};


var registerActivityTypes = function (toRegister) {

    var registerAT = function (a, callback) {
        console.log("registering ActivityType : ", a, argv.version);
        swfClient.client.registerActivityType({
            domain: argv.domain,
            name: a,
            version: argv.version
        }, function (err, results) {
            if (err) { console.log("err: ", err); }
            //console.log("RegisterActivityType results: ", results);
            callback();
        });
    };

    async.map(toRegister, registerAT, function (err) {
        if (err) {
            console.log(err);
        }
    });

};

var registerMissingActivityTypes = function (activityTypesToRegister) {

    swfClient.client.listActivityTypes({
        domain: argv.domain,
        registrationStatus: "REGISTERED",
        maximumPageSize: 500
    }, function (err, registeredActivityTypes) {
        if (err) {
            console.log("error", err);
            return;
        }

        registeredActivityTypes = registeredActivityTypes.typeInfos.map(function (w) {
            return w.activityType.name + '-v' + w.activityType.version;
        });

        var toRegister = [];

        activityTypesToRegister.forEach(function (a) {
            if (registeredActivityTypes.indexOf(a + '-v' + argv.version) === -1) {
                console.log("ActivityType " + a + " not registered yet !");
                toRegister.push(a);
            } else {
                console.log("ActivityType " + a + " already registered !");
            }
        });

        if (toRegister.length > 0) {
            registerActivityTypes(toRegister);
        }

    });

};

/**
 * Register everything within the current working directory
 */
if (argv._.length === 0) {

    // List workflows using a disk access
    var workflowsToRegister = [];
    var activityTypesToRegister = [];

    fs.readdirSync(process.cwd()).forEach(function (file) {
        var m;
        try {
            m = require(path.join(process.cwd(), file));
        } catch (ex) {
            console.log('Error loading '+file);
            console.log(ex);
            return;
        }
        if (m.workflow) {
            workflowsToRegister.push(file);
        }
        else if (m.worker) {
            activityTypesToRegister.push(file);
        }
        else {
            Object.keys(m).forEach(function(fctName) {
                activityTypesToRegister.push(file + '_' + fctName);
            });
        }
    });

    if (workflowsToRegister.length > 0) {
        registerMissingWorkflows(workflowsToRegister);
    }

    if (activityTypesToRegister.length > 0) {
        registerMissingActivityTypes(activityTypesToRegister);
    }

} else {

    /**
     * Single registration
     */

    var action, params;

    if (argv.k === "activity") {
        action = "registerActivityType";
        params = {
            name: argv._[0],
            domain: argv.d,
            version: argv.v
        };
    } else if (argv.k === "workflow") {
        action = "registerWorkflowType";
        params = {
            name: argv._[0],
            domain: argv.d,
            version: argv.v
        };
    } else if (argv.k === "domain") {
        action = "registerDomain";
        params = {
            name: argv._[0],
            description: "no description",
            workflowExecutionRetentionPeriodInDays: "1"
        };
    }

    swfClient.client[action](params, function (err, results) {

        if (err) {
            console.error(("Error in " + action).red);
            console.error(err);
            process.exit(1);
        }

        console.log(action + " OK !");
        console.log("results: ", results);

    });

}
