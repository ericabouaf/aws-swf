/*global schedule,stop,file,results,workflow_input,completed,start_childworkflow*/

// swf-start decompose-process "{\"taskDescription\":\"Create a website\"}"

/**
 * Step 1. Task identification
 */
schedule({
    name: 'taskIdentification',
    activity: 'humantask',
    input: function() {
      return {
        "data": workflow_input().taskDescription,
        "template": file('./decompose-process/task-identification.html')
      };
    }
}, {
  // No timeout
  heartbeatTimeout: "NONE",
  scheduleToCloseTimeout: "NONE",
  scheduleToStartTimeout: "NONE",
  startToCloseTimeout: "NONE"
});


// TODO: stop if not splittable !


/**
 * Step 2. Partition splittable tasks
 */

schedule({
    after: 'taskIdentification',
    name: 'split-tasks',
    activity: 'humantask',
    input: function() {
      return {
        "data": {
          "taskDescription": workflow_input().taskDescription,
          "taskIdentification": results("taskIdentification")
        },
        "template": file('./decompose-process/split-task.html')
      };
    }
}, {
  // No timeout
  heartbeatTimeout: "NONE",
  scheduleToCloseTimeout: "NONE",
  scheduleToStartTimeout: "NONE",
  startToCloseTimeout: "NONE"
});



// recursion on the results("split-tasks") results
if( completed('split-tasks') ) {

  var i = 0;
  results('split-tasks').steps.forEach(function(step) {

    i += 1;

    start_childworkflow({
       name: 'sub'+i,
       workflow: 'decompose-process',
       after: 'split-tasks'
    }, {
       taskStartToCloseTimeout: "3600",
       executionStartToCloseTimeout: "3600",
       childPolicy: "TERMINATE",
       taskList: {
          name: 'aws-swf-tasklist'
       },
       input: {
          taskDescription: step
       }
    });

  });


  stop({
      after: i > 0 ? 'sub'+i : 'split-tasks',
      result: {
        "taskDescription": workflow_input().taskDescription,
        "taskIdentification": results("taskIdentification"),
        "split-tasks": results("split-tasks")
      }
  });


}
