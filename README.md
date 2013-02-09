# A Node.js library for accessing Amazon Simple Workflow (SWF)


## Requirements

 * NodeJS >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts

## Installation

    npm install aws-swf


## See also

* [aws-swf-toolkit](https://github.com/neyric/aws-swf-toolkit): Node.js Framework for workflows on Amazon SWF
* [aws-swf-activities](https://github.com/neyric/aws-swf-activities): A collection of Node.js activity workers for Amazon SWF


## Documentation

aws-swf uses the official Node.js [aws-sdk](http://aws.amazon.com/documentation/sdkfornodejs/) for the low-level API calls. You can find the full [API reference here](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html)

aws-swf provide classes to wrap higher-level concepts of the AWS SWF API :

* ActivityPoller
* ActivityTask
* Decider
* DecisionTask
* Workflow
* WorkflowExecution


### Global configuration

Don't hardcode your Amazon credentials :

If no config is passed to createClient (see below), aws-swf will walk up the directory hierarchy until it finds a *.aws-swf.json* file.

    {
        "accessKeyId": "xxxxxx",
        "secretAccessKey": "xxxxxx",
        "region": "us-east-1",
        "defaultDomain": "aws-swf-test-domain",
        "defaultTasklist": "aws-swf-tasklist"
    }


### Creating an SWF client object

````javascript
var swf = require("aws-swf");
var swfClient = swf.createClient({
    accessKeyId: "... access key id here ...",
    secretAccessKey: "... secret key here ...",
    region: "us-east-1"
});
````

or using the global configuration file :

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

var swf = require("aws-swf");

var activityPoller = new swf.ActivityPoller(swfClient, {
    
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
var swf = require("aws-swf");

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



### Starting a Workflow

````javascript

var swf = require("aws-swf");

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


## Examples

Those examples should be executed in order :

* [Simple register](https://github.com/neyric/aws-swf/blob/master/examples/simple-register.js)

* [Simple activity worker example](https://github.com/neyric/aws-swf/blob/master/examples/simple-activity-worker.js)

* [Simple decider worker example](https://github.com/neyric/aws-swf/blob/master/examples/simple-decider-worker.js)

* [Starting a workflow](https://github.com/neyric/aws-swf/blob/master/examples/simple-start.js)

* [Express.js example](https://github.com/neyric/aws-swf/blob/master/examples/express-example.js)


## Decider API

* TODO: decider helper methods to make it easier to query the event history (dt.completed('step1'), dt.failed('step1'), dt.results('step1'))

  if (dt.failed()) {
    ...
    dt.scheduled()
  }

* ... to schedule tasks/timer/workflows etc...
  dt.schedule({
  ...
  })
* to stop, or signal, or ...



## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)
