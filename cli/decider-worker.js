/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var vm = require('vm'),
    fs = require('fs'),
    swf = require('../index');

// The task is given to this process as a command line argument in JSON format :
var decisionTaskConfig = JSON.parse(process.argv[2]),
    accessKeyId = process.argv[3],
    secretAccessKey = process.argv[4];

// You can customize the fetch_code method (might be in DB...)
var fetch_code_file = process.argv[5],
    fetch_code = require(fetch_code_file).fetch_code;

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

        if(err) {
            console.log(err);
            workflowFailed("Error in fetch_code", err);
            return;
        }

        var sandbox = {
            COMPLETED: 1,
            FAILED: 2,
            TIMEDOUT: 4,

            // read content of a file from the decider code
            file: function(path) {
                return fs.readFileSync(path).toString();
            }
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
                console.log(JSON.stringify(dt.decisions, null, 3));
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
