/*global schedule,stop,file,results,workflow_input,start_childworkflow*/

// swf-start decompose-process "{\"taskDescription\":\"Create a website\"}"

/**
 * Step 1. Task identification
 */
schedule({
    name: 'taskIdentification',
    activity: 'humantask',
    input: function() {
      return {
        data: workflow_input().taskDescription,
        template: file('./decompose-process/task-identification.html')
      };
    }
});


// exit cleanly if not splittable
stop({
  after: 'taskIdentification',
  conditionStr: 'splittable != yes',
  condition: function() {
    return results('taskIdentification').splittable !== 'yes';
  },
  result: {
      taskDescription: workflow_input().taskDescription,
      taskIdentification: results('taskIdentification')
  }
});



/**
 * Step 2. Partition splittable tasks
 */
schedule({
  after: 'taskIdentification',
  name: 'splitTasks',
  activity: 'humantask',
  conditionStr: 'splittable == yes',
  condition: function() {
    return results('taskIdentification').splittable === 'yes';
  },
  input: function() {
    return {
      data: {
        taskDescription: workflow_input().taskDescription,
        taskIdentification: results('taskIdentification')
      },
      template: file('./decompose-process/split-task.html')
    };
  }
});


// recursion on the results("splitTasks") results

var i = 0;
if(results('splitTasks')) {
  results('splitTasks').steps.forEach(function(step) {

    i += 1;

    start_childworkflow({
       name: 'sub-process-'+i,
       workflow: 'decompose-process',
       after: 'splitTasks'
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
}


stop({
    after: i > 0 ? (function() { var a=[]; for(var l=0;l<i;l++) { a.push("sub-process-"+(l+1)); } return a; })() : 'splitTasks',
    result: {
      taskDescription: workflow_input().taskDescription,
      taskIdentification: results('taskIdentification'),
      splitTasks: i > 0 ? {steps: (function() { var a=[]; for(var l=0;l<i;l++) { a.push(childworkflow_results("sub-process-"+(l+1))); } return a; })() } : results('splitTasks')
    }
});
