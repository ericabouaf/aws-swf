# Amazon SWF (Simple WorkFlow) toolkit for Node.js

This toolkit provides :

 * Command-line tools to interact with AWS SWF :
   * [swf-activity](#swf-activity)
   * [swf-decider](#swf-decider)
   * [swf-register](#swf-register)
   * [swf-start](#swf-start)

 * classes to wrap the common concepts of the AWS SWF API :
   * ActivityPoller
   * ActivityTask
   * Decider
   * DecisionTask
   * Workflow
   * WorkflowExecution


## Requirements

 * NodeJS & npm
 * An active AWS account and API credentials
 * Some understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/)


## Installation

````sh
$ [sudo] npm install aws-swf -g
````

The installation process will ask you for your AWS credentials, and store them in a config file.

You can change the credentials by calling :

    $ [sudo] swf-set-credentials


## Command-line usage & Beginners' Guide


### Step1: register all components

First we need to register a domain :

    $ swf-register -k domain aws-swf-test-domain

We then register a new workflow :

    $ swf-register -k workflow hello-workflow

Finally, we register a new activity type :

    $ swf-register -k activity hello-activity


### Step2: run the decider, and the activity poller

Launch a decider Poller:

    $ swf-decider examples/two-step-decider.js

Launch an Activity Poller:

    $ swf-activity examples/dummy-echo-worker.js

### Step3: Start the workflow !

    $ swf-start hello-workflow



## Command-line arguments

The command line tools use the credentials given to *swf-set-credentials* or at installation.

*swf-set-credentials* also stores a default SWF domain and tasklist, which are used as the default values for all swf-* commands.

### swf-register

    Register a new activity-type, workflow or domain on AWS SWF.
    Usage: swf-register -k resource-kind resource-name
    
    Options:
      -k, --kind     Kind of resource to register. "activity", "workflow", or "domain"  [default: "activity"]
      -d, --domain   SWF domain of the activity-type or workflow to register            [default: "aws-swf-test-domain"]
      -v, --version  version of the activity-type or workflow to register               [default: "1.0"]


### swf-activity

    Start an activity-poller for AWS SWF.
    Usage: swf-activity worker-file.js
    
    Options:
      -d, --domain    SWF domain              [default: "aws-swf-test-domain"]
      -t, --tasklist  tasklist                [default: "aws-swf-tasklist"]
      -i, --identity  identity of the poller  [default: "ActivityPoller-hostname-PID"]


### swf-decider

    Start a decider-poller for AWS SWF.
    Usage: swf-decider decider-file.js
    
    Options:
      -d, --domain    SWF domain              [default: "aws-swf-test-domain"]
      -t, --tasklist  tasklist                [default: "aws-swf-tasklist"]
      -i, --identity  identity of the poller  [default: "Decider-hostname-PID"]


### swf-start

    Start a workflow on AWS SWF.
    Usage: swf-start workflow-name
    
    Options:
      -d, --domain    SWF domain                        [default: "aws-swf-test-domain"]
      -t, --tasklist  tasklist                          [default: "aws-swf-tasklist"]
      -v, --version   version of the workflow to start  [default: "1.0"]


## Library Usage


### Creating an SWF client object

````javascript
var swf = require("aws-swf");
var swfClient = swf.createClient({
    accessKeyId: "... access key id here ...",
    secretAccessKey: "... secret key here ..."
});
````


### Creating an ActivityPoller

An *ActivityPoller* polls Amazon SWF for new tasks to be done.

An *ActivityTask* is instantiated by an *ActivityPoller* when it receives a task from SWF.

It is passed to your callback and adds the respondCompleted() and respondFailed() methods.

Example :


````javascript
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
````



### Creating a Decider

A *Decider* will poll Amazon SWF for new decision tasks.

A *DecisionTask* is instantiated by a *Decider* when it receives a decision task from SWF.

````javascript
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
````



### Using the simplified history (experimental)

A *getSimpleWorkflowHistory* is available on the *decisionTask* instance, which gives a simpler way to write deciders...

````javascript
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
````

### Register(Domain|ActivityType|WorkflowType)

    swfClient.RegisterDomain({...}, function(err, result) { ... });
    swfClient.RegisterActivityType({...}, function(err, result) { ... });
    swfClient.RegisterWorkflowType({...}, function(err, result) { ... });


### Generic SWF call (RAW call to the API)

````javascript
swfClient.DescribeDomain({"name": "test-my-swf"}, function(err, result) {
    
    if(err) console.log("error", err);
    
    console.log("result", JSON.stringify(result));
});
````


### Starting a Workflow

A *Workflow* 

````javascript
var workflow = new swf.Workflow(swfClient, {
   "domain": "test-domain",
   "workflowType": {
      "name": name,
      "version": version
   },
   "taskList": { "name": "my-workflow-tasklist" },

   "executionStartToCloseTimeout": "1800",
   "taskStartToCloseTimeout": "1800",

   "tagList": ["music purchase", "digital", "ricoh-the-dog"],
   "childPolicy": "TERMINATE"
});
````

TODO registerType

Registers a new workflow type and its configuration settings in the specified domain
* Important: If the type already exists, then a TypeAlreadyExists fault is returned. You cannot change the configuration settings of a workflow type once it is registered and it must be registered as a new version.




To start a new *workflowExecution* :

````javascript
var workflowExecution = workflow.start({ input: "{}"}, function(err, runId) {

   if(err) {
      console.log("Cannot start workflow : ", err);
      return;
   }

   console.log("Workflow started, runId: "+runId);

});
````

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


