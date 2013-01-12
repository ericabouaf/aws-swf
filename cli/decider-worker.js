/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var vm = require('vm'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var decisionTaskConfig = JSON.parse(process.argv[2]);

var accessKeyId = process.argv[3];
var secretAccessKey = process.argv[4];

// You can customize the fetch_code method (might be in DB...)
var fetch_code_file = process.argv[5];
var fetch_code = require(fetch_code_file).fetch_code;



// Create a new swf client
var swfClient = swf.createClient({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});


// Re-Create the Decision task
var dt = new swf.DecisionTask(swfClient, decisionTaskConfig);

function workflowFailed(reason, details) {
    dt.fail_workflow_execution(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("Workflow marked as failed ! (decider-worker)");
    });
}

var workflowName = decisionTaskConfig.workflowType.name;


try {

    // Call the async method to retreive the decider code content
    fetch_code(workflowName, function (err, deciderCode) {

        // TODO: handle err

        var sandbox = {
            COMPLETED: 1,
            FAILED: 2,
            TIMEDOUT: 4
        };

        // Expose all methods available on the DecisionTask as methods in the sandbox
        var dtFactory = function(fctName) {
            return function () {
                return dt[fctName].apply(dt, arguments);
            };
        };
        for(var k in dt) {
            if(typeof dt[k] === "function") {
                sandbox[k] = dtFactory(k);
            }
        }
        
        /*var scheduleMethodFactory = function(activityName) {
            return function(deciderParams, swfParams) {
                  var stepName = deciderParams.name;

                  if( !dt.scheduled(stepName) ) {

                     if( dt.check_conditions(deciderParams) ) {
                        // if swfParams.input is a function, evaluate it before !
                        if (typeof swfParams.input == "function") {
                           swfParams.input = swfParams.input();
                        }

                        if (!swfParams.activityType) {
                           swfParams.activityType = activityName;
                        }

                        dt.schedule(stepName, swfParams);
                     }

                  }

            };
        };

        // Expose all activities in the same domain
        activityNames.forEach(function(activityName) {
            var split = activityName.split('_');
            if(split.length === 2) {
                var namespace = split[0],
                    methodName = split[1];

                if(!sandbox[namespace]) {
                    sandbox[namespace] = {};
                }
                sandbox[namespace][methodName] = scheduleMethodFactory(activityName);
            }
            else {
                sandbox[activityName] = scheduleMethodFactory(activityName);
            }
        });*/


        // Run the decider code
        try {
            vm.runInNewContext(deciderCode, sandbox, workflowName + '.vm');
        } catch (ex) {
            console.log(ex);
            workflowFailed("Error executing workflow decider " + workflowName, "");
        }

        // Send the decisions back to SWF
        if (!dt.responseSent) {
            if (dt.decisions) {
                console.log("sending decisions...");
                dt.respondCompleted(dt.decisions);
            } else {
                console.log("No decision sent and no decisions scheduled !");
                dt.fail("Don't know what to do...");
            }
        }
    });

} catch (ex) {
    console.log(ex);
    workflowFailed("Error running the fetch_code method for workflowName : "+workflowName, "");
}

