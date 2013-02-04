/*global schedule,stop,file,results*/


/**
 * Step 1. Task identification
 */
schedule({
    name: 'taskIdentification',
    activity: 'humantask',
    input: function() {
      return {
        "data": "Create a twitter account",
        "template": file('./decompose-process/task-identification.html')
      };
    }
});



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
          "taskDescription": "Create a twitter account",
          "taskIdentification": results("taskIdentification")
        },
        "template": file('./decompose-process/split-task.html')
      };
    }
});




stop({
    after: 'split-tasks',
    result: "finished !"
});
