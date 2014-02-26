# A Node.js library for accessing Amazon Simple Workflow (SWF)

[![NPM version](https://badge.fury.io/js/aws-swf.png)](http://badge.fury.io/js/aws-swf)
[![Build Status](https://travis-ci.org/neyric/aws-swf.png?branch=master)](https://travis-ci.org/neyric/aws-swf)
[![Coverage Status](https://coveralls.io/repos/neyric/aws-swf/badge.png?branch=master)](https://coveralls.io/r/neyric/aws-swf?branch=master)
[![Code Climate](https://codeclimate.com/github/neyric/aws-swf.png)](https://codeclimate.com/github/neyric/aws-swf)

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


### Setting AWS Credentials

Cf. http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials

### Creating an ActivityPoller

An *ActivityPoller* polls Amazon SWF for new tasks to be done.

An *ActivityTask* is instantiated by an *ActivityPoller* when it receives a task from SWF.

It is passed to your callback and adds the respondCompleted() and respondFailed() methods.

Example :


````javascript

var swf = require('aws-swf');

var activityPoller = new swf.ActivityPoller({
    domain: 'test-domain',
    taskList: { name: 'my-workflow-tasklist' },
    identity: 'simple poller ' + process.pid
});

activityPoller.on('activityTask', function(task) {
    console.log("Received new activity task !");
    var output = task.input;

    task.respondCompleted(output, function (err) {

        if(err) {
            console.log(err);
            return;
        }

        console.log("responded with some data !");
    });
});


activityPoller.on('poll', function(d) {
    console.log("polling for activity tasks...", d);
});


// Start polling
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
var swf = require('aws-swf');

var myDecider = new swf.Decider({
   "domain": "test-domain",
   "taskList": {"name": "my-workflow-tasklist"},
   "identity": "Decider-01",
   "maximumPageSize": 100,
   "reverseOrder": false // IMPORTANT: must replay events in the right order, ie. from the start
});

myDecider.on('decisionTask', function (decisionTask) {

    console.log("Got a new decision task !");

    if(!decisionTask.eventList.scheduled('step1')) {
        decisionTask.response.schedule({
            name: 'step1',
            activity: 'simple-activity'
        });
    }
    else {
        decisionTask.response.stop({
          result: "some workflow output data"
        });
    }

    decisionTask.response.respondCompleted(decisionTask.response.decisions, function(err, result) {

      if(err) {
          console.log(err);
          return;
      }

      console.log("responded with some data !");
    });

});

myDecider.on('poll', function(d) {
    //console.log(this.config.identity + ": polling for decision tasks...");
    console.log("polling for tasks...", d);
});

// Start polling
myDecider.start();
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

var workflow = new swf.Workflow({
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


## API Documentation

The API documentation is available online : http://neyric.github.io/aws-swf/apidoc/

    jsdoc lib/*.js README.md -d apidoc

## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)
