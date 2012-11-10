# Amazon SWF (Simple WorkFlow) toolkit for Node.js

This toolkit provides command-line tools to interact with AWS SWF :

* [swf-activity](#swf-activity): start activity pollers which spawn activity workers
* [swf-decider](#swf-decider): start decider pollers which spawn decider workers
* [swf-register](#swf-register): register SWF resources
* [swf-start](#swf-start): start workflow executions

The [aws-swf-activities](https://github.com/neyric/aws-swf-activities) repository contains a collection of activities that can be used with the swf-activity command.

You can also use [aws-swf as a library](#library-usage) for any Node.js app.

Here is an overview of the interactions between Amazon SWF and the aws-swf pollers :

![AWS-SWF Overview](/neyric/aws-swf/raw/master/diagram.png "AWS-SWF Overview")


## Requirements

 * NodeJS >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts


## Installation

````sh
$ [sudo] npm install aws-swf -g
````

It is then recommended to call the *swf-set-credentials* command, which will ask you for your AWS credentials, and store them in a config file.
Those credentials will then be used by all others swf-* commands.

````sh
$ [sudo] swf-set-credentials
````

If you don't call set your credentials, you will have to call the commands with the credentials passed as options :


````sh
$ swf-register --accessKeyId "... your accessKeyId ..." --secretAccessKey "... your secret key id..." ...
````

## Command-line usage & Beginners' Guide

This small tutorial will use the examples in the *examples/* directory.

### Step1: register all components

First we need to register a domain :

````sh
$ swf-register -k domain aws-swf-test-domain
````

We then register all workflows from examples/workflows :

````sh
$ cd examples/workflows
$ swf-register
````

Finally, we will register all activity types from examples/activities :

````sh
$ cd examples/activities
$ swf-register
````


### Step2: run the decider, and the activity poller

Launch a decider Poller:

````sh
$ cd examples/workflows
$ swf-decider
````

Launch an Activity Poller:

````sh
$ cd examples/activities
$ swf-activity
````

### Step3: Start the workflow !

````sh
$ swf-start hello-workflow "{\"a\":4,\"b\":6}"
````



### Step4: How does this first example works

First, let's have a look at the first decider example :

````javascript
// step1 -> step2 -> terminate

if (just_started) {

    schedule('step1', {
        activityType: 'hello-activity',
        input: {}
    });

} else if (completed('step1') && !scheduled('step2')) {

    schedule('step2', {
        activityType: 'echo',
        input: results('step1')
    });
} else if (completed('step2')) {
    stop("finished !");
}
````

#### What happened ?

 * The hello-workflow is started on SWF through the swf-start command, with the string "{\"a\":4,\"b\":6}" as input
 * SWF: schedules a Decision task
 * DECIDER: Receives the decision task. As just_started is true, the step1 is scheduled.
 * SWF: schedules the step1 activity
 * ACTIVITY: Receives the activity task. The echo task will return as "result" what it as been given as input (ie the "{\"a\":4,\"b\":6}" string...)
 * SWF: receives step1 results and schedule a decision task
 * DECIDER: receives the decision task. This time, step1 is completed, but step2 is not completed, so step2 is scheduled
 * SWF: schedules the step2 activity
 * ACTIVITY: Receives the activity task. The sum task will decode its input (in JSON format), and return the sum of a and b
 * SWF: receives step2 results and schedule a decision task
 * DECIDER: receives the decision task. step2 is completed so we send a CompleteWorkflowExecution through the stop() function
 * SWF: mark the workflow execution as completed


## swf-set-credentials

All swf-* command line tools use the credentials given to *swf-set-credentials* or at installation.

*swf-set-credentials* also stores a default SWF domain and tasklist, which are used as the default values for all swf-* commands.


## swf-register

Register a new activity-type, workflow or domain on AWS SWF.

Usage: swf-register -k resource-kind resource-name

    Options:
      -k, --kind     Kind of resource to register. "activity", "workflow", or "domain"  [default: "activity"]
      -d, --domain   SWF domain of the activity-type or workflow to register            [default: "aws-swf-test-domain"]
      -v, --version  version of the activity-type or workflow to register               [default: "1.0"]
      -h, --help     show this help                                                   


Examples :

    # Register all workflows and activities in the working directory
    $ swf-register
    
    # Register a new domain
    $ swf-register -k domain my-domain-name
    
    # Register a new activity
    $ swf-register -k activity -d my-domain-name -v 2.0
    
    # Register a new workflow
    $ swf-register -k workflow -d my-domain-name -v 1.0


## swf-activity

Start an activity-poller for AWS SWF.

Usage: swf-activity

    Options:
        -f, --file      file to execute in a node spawed process  [default: "/Users/neyric/git/aws-swf/cli/activity-worker.js"]
        -d, --domain    SWF domain                                [default: "aws-swf-test-domain"]
        -t, --tasklist  tasklist                                  [default: "aws-swf-tasklist"]
        -i, --identity  identity of the poller                    [default: "ActivityPoller-hostname-PID"]
        -h, --help      show this help                          
        -c, --fetchconfigfile  js file which exports the fetch_config method  [default: "/Users/neyric/git/aws-swf/cli/fetch_config_file.js"]
        --accessKeyId          AWS accessKeyId                              
        --secretAccessKey      AWS secretAccessKey 

Examples :

    # Start an activity poller for all activity modules in the working directory
    $ cd examples/activities
    $ swf-activity
    
    # Same thing but on a different domain & taskList
    $ cd examples/activities
    $ swf-activity -t server-A-taskList -d my-domain-name


### How it works

What does swf-activity do :

 * Creates an *ActivityPoller*, which polls SWF for new activity tasks
 * For each new activity task received, spawns a node process (specified by -f), passing the activity task as an argument in JSON.
 * The default process file (activity-worker.js), will use the 'fetchconfigfile' to retreive the global configuration for this activity (such as credentials). The default fetchconfigfile will look for a file named config.json in the activity directory.
 * Then, it will look for a node.js module in the current working directory with the same name as the activity type, and call *worker(task, config)*
 * When the spawed process exits, polls for new activity tasks

What does swf-activity doesn't do :

 * The main poller process doesn't send any result to SWF. It is up to the worker module to send the response ! ( task.respondCompleted or respondFailed )


Check out the [aws-swf-activities](https://github.com/neyric/aws-swf-activities) project which provides some common activity workers such as :

 * making an HTTP request
 * sending an email
 * making a SOAP request
 * making an XMLRPC request
 * etc...


## swf-decider

Start a decider-poller for AWS SWF.

Usage: swf-decider


    Options:
      -f, --file      file to execute in a node spawed process  [default: "/Users/neyric/git/aws-swf/cli/decider-worker.js"]
      -d, --domain    SWF domain                                [default: "aws-swf-test-domain"]
      -t, --tasklist  tasklist                                  [default: "aws-swf-tasklist"]
      -i, --identity  identity of the poller                    [default: "Decider-new-host-4.home-95630"]
      -h, --help      show this help                          
      -c, --fetchcodefile  js file which exports the fetch_code method  [default: "/Users/neyric/git/aws-swf/cli/fetch_code_file.js"]
      --accessKeyId        AWS accessKeyId                            
      --secretAccessKey    AWS secretAccessKey                        


Examples :

      # Start an decider poller for all workflow modules in the working directory
      $ cd examples/workflows
      $ swf-decider
      
      # Same thing but on a different domain & taskList
      $ cd examples/workflows
      $ swf-decider -t my-decider-taskList -d my-domain-name

### How it works

What does swf-decider do :

 * Creates a *Decider*, which polls SWF for new decision tasks
 * For each new decision task received, spawns a node process (specified by -f), passing the decision task as an argument in JSON.
 * The default process file (decider-worker.js), will use the 'fetchcodefile' to retreive the code for the decider. (by default, it looks for a node.js module in the current working directory with the same name as the workflow) and call *workflow(decisionTask)*
 * When the spawed process exits, polls for new decision tasks


Advantages of spawning the decider in a new process :

 * When a decider crashes, the poller still continues to poll for new decision tasks
 * In development mode, you don't need to restart the poller to change the decider


### Writing deciders

Here is a list of API methods available on the *decisionTask* passed to the workflow module :


Query the state of the workflow :

 * just_started : true if no activity has been scheduled yet (workflow just started)
 * completed('step1') : returns true if the activityId 'step1' is completed
 * scheduled('step2') : returns true if the activityId 'step2' has been scheduled (event if it's completed, failed, timedout, ...)
 
Respond some decisions :

 * schedule('step1', { activityType: 'hello-activity' }) : schedule a new activity task. 'step1' will be used as the activityId. The second parameter can contain any SWF property (timeouts, tasklists, etc...)
 * waiting_for('step1','step2') : respond no decision, but assert that step1 and step2 can eventually finish. If not, throws an exception, which will result in a FailWorkflowExecution.


Get the data :

 * workflow_input() : returns the string passed as "input" at workflow start
 * results('step1') : returns the result value of activity 'step1'

End workflow executions :

 * stop("finished !") : stops the workflow execution (CompleteWorkflowExecution)
 * fail("reason of failure") : stops the workflow execution (FailWorkflowExecution)

## swf-start

Start a workflow execution on AWS SWF.

Usage: swf-start workflow-name [input data]


    Options:
      -d, --domain                    SWF domain                                                      [default: "aws-swf-test-domain"]
      -t, --tasklist                  tasklist                                                        [default: "aws-swf-tasklist"]
      -v, --version                   version of the workflow to start                                [default: "1.0"]
      -i, --workflowId                user defined identifier associated with the workflow execution
      --executionStartToCloseTimeout  executionStartToCloseTimeout in seconds                         [default: "1800"]
      --taskStartToCloseTimeout       taskStartToCloseTimeout in seconds                              [default: "1800"]
      --childPolicy                   childPolicy                                                     [default: "TERMINATE"]
      --tag                           tag to add to this workflow execution. Can have multiple.     
      --accessKeyId        AWS accessKeyId                            
      --secretAccessKey    AWS secretAccessKey       


Examples :

    # Start a hello-workflow on the default domain and tasklist
    $ swf-start hello-workflow
    
    # Start a hello-workflow on another domain and tasklist
    $ swf-start hello-workflow -d my-domain-name -t hello-tasklist










## Library Usage

The aws-swf library provide classes to wrap the common concepts of the AWS SWF API :

* ActivityPoller
* ActivityTask
* Decider
* DecisionTask
* Workflow
* WorkflowExecution


### Creating an SWF client object

````javascript
var swf = require("aws-swf");
var swfClient = swf.createClient({
    accessKeyId: "... access key id here ...",
    secretAccessKey: "... secret key here ..."
});
````

If no config is passed to createClient, we'll use the config.js file written by swf-set-credentials.

````javascript
var swf = require("aws-swf"),
    swfClient = swf.createClient();
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
   
}, function (activityTask, cb) {
   
   console.log('A new task is available !');
   // Do something here...
   
   // sends "RespondActivityTaskCompleted" to SWF
   // result: Maximum length of 32768.
   activityTask.respondCompleted(result, function (err) {
      cb(true); // free the poller for new activities
   }); 
   
   // or :
   
   // sends "RespondActivityTaskFailed" to SWF
   // parameters: 
   // reason (string or undefined): Maximum length of 256
   // details (string or undefined): Maximum length of 32768
   activityTask.respondFailed(reason, details, function (err) {
       cb(true); // free the poller for new activities
   });
   
});

activityPoller.start();
````


It is not recommanded to stop the poller in the middle of a long-polling request, because SWF might schedule an ActivityTask to this poller anyway, which will obviously timeout.
The .stop() method will wait for the end of the current polling request, eventually wait for a last activity execution, then stop properly :

````javascript
// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
   console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
   activityPoller.stop();
});
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
   
}, function (decisionTask, cb) {
    
    // do something here and send decisions...
    
    decisionTask.complete_workflow_execution("details of ending here ?", function (err) {
        
    });
    
    cb(true); // to continue polling
});
````


It is not recommanded to stop the poller in the middle of a long-polling request, because SWF might schedule an ActivityTask to this poller anyway, which will obviously timeout.
The .stop() method will wait for the end of the current polling request, eventually wait for a last activity execution, then stop properly :


````javascript
// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
   console.log('Got SIGINT ! Stopping decider poller after this request...please wait...');
   myDecider.stop();
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



### Starting a Workflow

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

   "tagList": ["music purchase", "digital"],
   "childPolicy": "TERMINATE"
});
````

To start a new *workflowExecution* :

````javascript
var workflowExecution = workflow.start({ input: "{}"}, function (err, runId) {

   if (err) {
      console.log("Cannot start workflow : ", err);
      return;
   }

   console.log("Workflow started, runId: " +runId);

});
````



### Register(Domain|ActivityType|WorkflowType)

    swfClient.RegisterDomain({...}, function (err, result) { ... });
    swfClient.RegisterActivityType({...}, function (err, result) { ... });
    swfClient.RegisterWorkflowType({...}, function (err, result) { ... });


### Generic SWF call (RAW call to the API)

````javascript
swfClient.DescribeDomain({"name": "test-my-swf"}, function (err, result) {
    
    if (err) console.log("error", err);
    
    console.log("result", JSON.stringify(result));
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


