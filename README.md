# A Node.js library for accessing Amazon Simple Workflow (SWF)

[![NPM version](https://badge.fury.io/js/aws-swf.png)](http://badge.fury.io/js/aws-swf)
[![Build Status](https://travis-ci.org/neyric/aws-swf.png?branch=master)](https://travis-ci.org/neyric/aws-swf)
[![Coverage Status](https://coveralls.io/repos/neyric/aws-swf/badge.png?branch=master)](https://coveralls.io/r/neyric/aws-swf?branch=master)
[![Code Climate](https://codeclimate.com/github/neyric/aws-swf.png)](https://codeclimate.com/github/neyric/aws-swf)

**aws-swf** provides high-level classes to build Amazon Simple Workflows using Node.js.

It is built on top of the official Node.js [aws-sdk](http://aws.amazon.com/documentation/sdkfornodejs/) for low-level API calls. You can find the full [API reference here](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html).


## Requirements

 * [node.js](http://nodejs.org/) >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts

## Installation

    npm install aws-swf


### Setting AWS Credentials

Cf. http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_AWS_Credentials


## Usage


### Step 1 : Register Domains, ActivityTypes, WorkflowTypes

The AWS SDK is sufficient to register SWF objects, since those are just direct API calls.
(You can also register them through the [AWS console](https://console.aws.amazon.com/swf/home).)

You can run the following example to register the objects used in the following examples :

[Example to register "test-domain", "simple-activity" and "simple-workflow"](https://github.com/neyric/aws-swf/blob/master/examples/simple-register.js)



### Step 2 : Create Activity Workers

An **[ActivityPoller](http://neyric.github.io/aws-swf/apidoc/ActivityPoller.html)** will wait for new tasks from SWF, and emit an **activityTask** event.
The event receives an instance of **[ActivityTask](http://neyric.github.io/aws-swf/apidoc/ActivityTask.html)**, which makes it easier to send the response to SWF.

[This example](https://github.com/neyric/aws-swf/blob/master/examples/simple-activity-worker.js) starts an Activity Worker which completes immediatly.



### Step 3 : Create Workflow Deciders

The **[Decider](http://neyric.github.io/aws-swf/apidoc/Decider.html)** class will wait for new decision tasks from SWF, and emit a **decisionTask** event.
The event receives an instance of **[DecisionTask](http://neyric.github.io/aws-swf/apidoc/DecisionTask.html)**, composed of :

 * an **[EventList](http://neyric.github.io/aws-swf/apidoc/EventList.html)** instance, to query the state of the workflow
 * a **[DecisionResponse](http://neyric.github.io/aws-swf/apidoc/DecisionResponse.html)** instance, to prepare the decider response with decisions

[Simple decider worker example](https://github.com/neyric/aws-swf/blob/master/examples/simple-decider-worker.js) : decision worker, which schedules an activity task, then stop the workflow.



### Step 4 : Start a workflow

To start a workflow, call the *start* method on a **[Workflow](http://neyric.github.io/aws-swf/apidoc/Workflow.html)** instance. This call will return a **[WorkflowExecution](http://neyric.github.io/aws-swf/apidoc/WorkflowExecution.html)** instance, which you can use to signal or terminate a workflow.

* [Starting a workflow](https://github.com/neyric/aws-swf/blob/master/examples/simple-start.js) : start an instance of the simple workflow example.



## AWS Options

Sometimes you may want to configure the AWS SDK instance. A possible reason is
to set a specific region for `aws-swf`. Because Node.js allows multiple
instances of the same package for maximal compatibility among libraries, you
would need to do something similar to:

```js
var AWS = require('./node_modules/aws-swf/node_modules/aws-sdk/lib/aws');
```

Instead, you simlpy need to do:

```js
var AWS = require('aws-swf').AWS;
```

An example use case would be:

```js
var AWS = require('aws-swf').AWS;

AWS.config = new AWS.Config({
  region: process.env.AWS_REGION || 'us-west-2',
  apiVersions: {
    swf: '2012-01-25'
  }
});
```



## API Documentation

The API documentation is available online at http://neyric.github.io/aws-swf/apidoc/

To rebuild the documentation, install jsdoc, then :

    jsdoc lib/*.js README.md -d apidoc


## Test

Tests can be executed with Mocha :

    $ mocha

To get the coverage, run :

    $ ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha

Then open coverage/lcov-report/index.html


To send the coverage to coveralls, I run locally (I don't know why travis-ci after-script doesn't work...):

    $ NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | COVERALLS_REPO_TOKEN=xxxx ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)


## See also

* [aws-swf-toolkit](https://github.com/neyric/aws-swf-toolkit): Node.js Framework for workflows on Amazon SWF
* [aws-swf-activities](https://github.com/neyric/aws-swf-activities): A collection of Node.js activity workers for Amazon SWF

