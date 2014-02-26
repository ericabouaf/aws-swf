# A Node.js library for accessing Amazon Simple Workflow (SWF)

[![NPM version](https://badge.fury.io/js/aws-swf.png)](http://badge.fury.io/js/aws-swf)
[![Build Status](https://travis-ci.org/neyric/aws-swf.png?branch=master)](https://travis-ci.org/neyric/aws-swf)
[![Coverage Status](https://coveralls.io/repos/neyric/aws-swf/badge.png?branch=master)](https://coveralls.io/r/neyric/aws-swf?branch=master)
[![Code Climate](https://codeclimate.com/github/neyric/aws-swf.png)](https://codeclimate.com/github/neyric/aws-swf)

**aws-swf** provides high-level classes to build Amazon Simple Workflows using Node.js.

It is built on top of the official Node.js [aws-sdk](http://aws.amazon.com/documentation/sdkfornodejs/) for low-level API calls. You can find the full [API reference here](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html)


## Requirements

 * NodeJS >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts

## Installation

    npm install aws-swf


### Setting AWS Credentials

Cf. http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials


## Usage


### Step 1 : Register Domains, ActivityTypes, WorkflowTypes

The AWS SDK is sufficient to register SWF objects, since those are juste direct API calls. (You could also do it through the AWS console.)

You can run the following example to register the objects used in the following examples :

[Example to register "test-domain", "simple-activity" and "simple-workflow"](https://github.com/neyric/aws-swf/blob/master/examples/simple-register.js)



### Step 2 : Create Activity Workers

An **ActivityPoller** will wait for new tasks from SWF, and emit an **activityTask** event.
The event receives an instance of **ActivityTask**, which makes it easier to send the response to SWF.

[See this example](https://github.com/neyric/aws-swf/blob/master/examples/simple-activity-worker.js), which starts an Activity Worker which completes immediatly, returning its input as output.



### Step 3 : Create Workflow Deciders

The **Decider** class will wait for new decision tasks from SWF, and emit a **decisionTask** event.
The event receives an instance of **DecisionTask**, composed of :

 * an EventList instance, to query the state of the workflow
 * a DecisionResponse instance, to prepare the decider response with decisions

[Simple decider worker example](https://github.com/neyric/aws-swf/blob/master/examples/simple-decider-worker.js) : decision worker, which schedules an activity task, then stop the workflow.

You might want to check the API documentation for those objects :

* [EventList API](http://neyric.github.io/aws-swf/apidoc/EventList.html)
* [DecisionResponse API](http://neyric.github.io/aws-swf/apidoc/DecisionResponse.html)


### Step 4 : Start a workflow

* Workflow
* WorkflowExecution


* [Starting a workflow](https://github.com/neyric/aws-swf/blob/master/examples/simple-start.js) : start an instance of the simple workflow example.




## API Documentation

The API documentation is available online : http://neyric.github.io/aws-swf/apidoc/

    jsdoc lib/*.js README.md -d apidoc


## Test

Tests can be executed with Mocha :

    $ mocha


## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)


## See also

* [aws-swf-toolkit](https://github.com/neyric/aws-swf-toolkit): Node.js Framework for workflows on Amazon SWF
* [aws-swf-activities](https://github.com/neyric/aws-swf-activities): A collection of Node.js activity workers for Amazon SWF

