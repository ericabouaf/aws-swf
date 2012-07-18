# Amazon SWF (Simple WorkFlow) library for Node.js

This library provides classes to wrap the common concepts of the Amazon SWF API :

 * ActivityPoller
 * ActivityTask
 * Decider
 * DecisionTask
 * Workflow
 * WorkflowExecution

## Install

    npm install aws-swf

## Usage

### Creating an SWF client object

    
    var swf = require("aws-swf");
    var swfClient = swf.createClient({
        accessKeyId: "... access key id here ...",
        secretAccessKey: "... secret key here ..."
    });



### Creating an ActivityPoller

An *ActivityPoller* polls Amazon SWF for new tasks to be done.

An *ActivityTask* is instantiated by an *ActivityPoller* when it receives a task from SWF.

It is passed to your callback and adds the respondCompleted() and respondFailed() methods.

Example :

    
    
    var activityPoller = new ActivityPoller(swfClient, {
        
       "domain": "test-domain",
       "taskList": { "name": "test-taskList" },
       "identity": "ActivityPoller-1"
       
    }, function(activityTask, cb) {
       
       console.log('A new task is available !');
       // Do something here...
       
       // sends "RespondActivityTaskCompleted" to SWF
       // result: Maximum length of 32768.
       activityTask.respondCompleted(result, function(err) {
          cb(true); // free the poller for new activities
       }); 
       
       // or :
       
       // sends "RespondActivityTaskFailed" to SWF
       // parameters: 
       // reason (string or undefined): Maximum length of 256
       // details (string or undefined): Maximum length of 32768
       activityTask.respondFailed(reason, details, function(err) {
           cb(true); // free the poller for new activities
       });
       
    });
    
    activityPoller.start();
    



### Creating a Decider

A *Decider* will poll Amazon SWF for new decision tasks.

A *DecisionTask* is instantiated by a *Decider* when it receives a decision task from SWF.
    
    var myDecider = new swf.Decider(swfClient, {
        
       "domain": "test-domain",
       "taskList": {"name": "my-workflow-tasklist"},
       "identity": "Decider-01",
       
       "maximumPageSize": 500,
       "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
       
    }, function(decisionTask, cb) {
        
        // do tomething and send a TODO
        
        decisionTask.CompleteWorkflowExecution("details of ending here ?");
        
        cb(true); // to continue polling
    });
    



### Using the simplified history (experimental)

A *getSimpleWorkflowHistory* is available on the *decisionTask* instance, which gives a simpler way to write deciders...

    var workflowHistory = decisionTask.getSimpleWorkflowHistory();
    /*
    workflowHistory = {
        input: "...workflow input data...",
        activities: [
            {
                input: "...activity input data...",
                activityId: "theActivityId",
                lastEvent: "..."
                result: "..."
            }
        ]
    }
    */


### Register(Domain|ActivityType|WorkflowType)

    swfClient.RegisterDomain({...}, function(err, result) { ... });
    swfClient.RegisterActivityType({...}, function(err, result) { ... });
    swfClient.RegisterWorkflowType({...}, function(err, result) { ... });


### Generic SWF call (RAW call to the API)

    swfClient.DescribeDomain({"name": "test-my-swf"}, function(err, result) {
        
        if(err) console.log("error", err);
        
        console.log("result", JSON.stringify(result));
    });



### Starting a Workflow

A *Workflow* 

    var workflow = new swf.Workflow(swfClient, {
       "domain": "test-domain",
       "workflowType": {
          "name": name,
          "version": version
       },
       "taskList": { "name": "QUICKFLOW_DECIDER" },
   
       "executionStartToCloseTimeout": "1800",
       "taskStartToCloseTimeout": "1800",
   
       "tagList": ["music purchase", "digital", "ricoh-the-dog"],
       "childPolicy": "TERMINATE"
    });


TODO registerType

Registers a new workflow type and its configuration settings in the specified domain
* Important: If the type already exists, then a TypeAlreadyExists fault is returned. You cannot change the configuration settings of a workflow type once it is registered and it must be registered as a new version.




To start a new *workflowExecution* :

    var workflowExecution = workflow.start({ input: "{}"}, function(err, runId) {
   
       if(err) {
          console.log("Cannot start workflow : ", err);
          return;
       }
   
       console.log("Workflow started, runId: "+runId);
   
    });


### Raw Methods

The detailed API documentation http://docs.amazonwebservices.com/amazonswf/latest/apireference/Welcome.html

 * CountClosedWorkflowExecutions
 * CountOpenWorkflowExecutions
 * CountPendingActivityTasks
 * CountPendingDecisionTasks
 * DeprecateActivityType
 * DeprecateDomain
 * DeprecateWorkflowType
 * DescribeActivityType
 * DescribeDomain
 * DescribeWorkflowExecution
 * DescribeWorkflowType
 * GetWorkflowExecutionHistory
 * ListActivityTypes
 * ListClosedWorkflowExecutions
 * ListDomains
 * ListOpenWorkflowExecutions
 * ListWorkflowTypes
 * PollForActivityTask
 * PollForDecisionTask
 * RecordActivityTaskHeartbeat
 * RegisterActivityType
 * RegisterDomain
 * RegisterWorkflowType
 * RequestCancelWorkflowExecution
 * RespondActivityTaskCanceled
 * RespondActivityTaskCompleted
 * RespondActivityTaskFailed
 * RespondDecisionTaskCompleted
 * SignalWorkflowExecution
 * StartWorkflowExecution
 * TerminateWorkflowExecution



## Running the examples

 * Copy examples/config.example.js to examples/config.js and edit  your AWS credentials
 * run the examples :)



