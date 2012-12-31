# Amazon SWF (Simple WorkFlow) toolkit for Node.js

This toolkit provides command-line tools to interact with the AWS SWF service :

* [swf-activity](https://github.com/neyric/aws-swf/wiki/swf-activity-command): start activity pollers which spawn activity workers
* [swf-decider](https://github.com/neyric/aws-swf/wiki/swf-decider): start decider pollers which spawn decider workers
* [swf-register](https://github.com/neyric/aws-swf/wiki/swf-register): register SWF resources
* [swf-start](https://github.com/neyric/aws-swf/wiki/swf-start): start workflow executions

The [activities/ directory](https://github.com/neyric/aws-swf/tree/master/activities) contains a collection of activities that can be used with the swf-activity command.

You can also use [aws-swf as a library](https://github.com/neyric/aws-swf/wiki/Library-Usage) for any Node.js app.

AWS SWF uses [the official JavaScript implementation of the AWS SDK for Node.js](http://aws.amazon.com/documentation/sdkfornodejs/) for the low-level API calls.

Here is an overview of the interactions between Amazon SWF and the aws-swf pollers :

![AWS-SWF Overview](/neyric/aws-swf/raw/master/diagram.png "AWS-SWF Overview")


## Requirements

 * NodeJS >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts


Install with :

````sh
$ [sudo] npm install -g aws-swf
````

For more detailed installation instructions, check the [Installation Wiki Page](https://github.com/neyric/aws-swf/wiki/Installation)