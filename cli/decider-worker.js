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

var swfClient = swf.createClient({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});


var fetch_code_file = process.argv[5];
var fetch_code = require(fetch_code_file).fetch_code;


var encodedActivityNames = process.argv[6];
var activityNames = JSON.parse(encodedActivityNames);


// Create the Decision task
var dt = new swf.DecisionTask(swfClient, decisionTaskConfig);

function workflowFailed(reason, details) {
    dt.fail_workflow_execution(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("Workflow marked as failed !");
    });
}

var workflowName = decisionTaskConfig.workflowType.name;

fetch_code(workflowName, function (err, deciderCode) {

    try {

        var sandbox = {

            just_started: dt.just_started(),

            schedule: function () {
                dt.schedule.apply(dt, arguments);
            },
            scheduled: function () {
                return dt.scheduled.apply(dt, arguments);
            },
            waiting_for: function () {
                dt.waiting_for.apply(dt, arguments);
            },
            completed: function () {
                return dt.completed.apply(dt, arguments);
            },

            start_childworkflow: function() {
                return dt.start_childworkflow.apply(dt, arguments);  
            },

            childworkflow_scheduled: function() {
                return dt.childworkflow_scheduled.apply(dt, arguments);  
            },

            childworkflow_completed: function() {
                return dt.childworkflow_completed.apply(dt, arguments);  
            },
            
            stop: function (deciderParams, val) {

               var canStop = true;

               // TODO: check all conditions are met !
               if (deciderParams.after) {
                  
                  for(var cdtName in deciderParams.after) {
                     var condition = deciderParams.after[cdtName];

                     if(condition === 1 /*COMPLETED*/ && !dt.completed(cdtName) ) {
                        canStop = false;
                        if (!dt.decisions) {
                           dt.decisions = []; // so we don't stop...
                        }
                     }
                     // TODO: handle other conditions
                  }

               }

               // TODO: check deciderParams
               if(canStop) {
                dt.stop(val);
               }
            },
            COMPLETED: 1,
            FAILED: 2,
            TIMEDOUT: 4,

            results: function () {
                var resultData = dt.results.apply(dt, arguments);
                try {
                    var d = JSON.parse(resultData);
                    return d;
                } catch (ex) {
                    return resultData;
                }
            },
            workflow_input: function () {
                var wfInput = dt.workflow_input.apply(dt, arguments);
                try {
                    var d = JSON.parse(wfInput);
                    return d;
                } catch (ex) {
                    return wfInput;
                }
            },
            log: function () {
                console.log.apply(console, ["DECIDER LOG : "].concat(arguments));
            }
        };



         activityNames.forEach(function(activityName) {



            var schedule_method = function(deciderParams, swfParams) {
                  var stepName = deciderParams.name;

                  if( !dt.scheduled(stepName) ) {

                     //console.log(stepName+ " is not scheduled yet !");

                     var canSchedule = true;

                     // TODO: check all conditions are met !
                     if (deciderParams.after) {
                        
                        if(typeof deciderParams.after === "string") {
                           canSchedule = dt.completed(deciderParams.after);
                        }
                        else {
                           for(var cdtName in deciderParams.after) {
                              var condition = deciderParams.after[cdtName];

                              if(condition === 1 /*COMPLETED*/ && !dt.completed(cdtName) ) {
                                 canSchedule = false;
                                 if (!dt.decisions) {
                                    dt.decisions = []; // so we don't stop...
                                 }
                              }
                              // TODO: handle other conditions
                           }
                        }

                     }

                     if(canSchedule) {
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

            var split = activityName.split('_');

            if(split.length === 2) {
                var namespace = split[0],
                    methodName = split[1];

                if(!sandbox[namespace]) {
                    sandbox[namespace] = {};
                }
                sandbox[namespace][methodName] = schedule_method;
            }
            else {
                sandbox[activityName] = schedule_method;
            }


         });



        try {

            vm.runInNewContext(deciderCode, sandbox, workflowName + '.vm');

        } catch (ex) {
            console.log(ex);
            workflowFailed("Error executing workflow decider " + workflowName, "");
        }

        if (!dt.responseSent) {

            if (dt.decisions) {
                console.log("sending decisions...");
                dt.respondCompleted(dt.decisions);
            } else {
                console.log("No decision sent and no decisions scheduled !");
                dt.fail("Don't know what to do...");
            }

        }


    } catch (ex) {
        console.log(ex);
        workflowFailed("Unable to load workflow module " + workflowName, "");
    }

});
