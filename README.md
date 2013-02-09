# aws-swf - A Node.js library for accessing Amazon Simple Workflow (SWF)

nice & clean library to access the Amazon SWF API = exposing a nice object interface (just map swf concepts +  etc...)

High-level classes to use [aws-swf as a library](https://github.com/neyric/aws-swf/wiki/Library-Usage) from any Node.js application.

## Requirements

 * NodeJS >= 0.8
 * An active [AWS account](http://aws.amazon.com/) with [Access Keys](http://docs.amazonwebservices.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#AccessKeys)
 * Basic understanding of [AWS SimpleWorkflow](http://aws.amazon.com/en/documentation/swf/) concepts


## Features:

* auto-reconnect option for pollers

* auto-registration


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


## examples

  - simple-poller which executes 3 lines of JS

    var activityPoller = new swf.ActivityPoller(swfClient, {
        domain: 'my-domain',
        taskList: { name: 'task-list' },
        identity: 'simple poller ' + process.pid
    }, function (task, cb) {
        task.respondCompleted({captcha_text: 'data'}, function (err) {});
    });
    activityPoller.start();


  - poller which spawn another process (ex which calls the 'dot' cli ?)
  - swf-start from any Node.js project
  - express-form-server : simple express app which serves a form and start a workflow with a transformated value (Note: also works for any POST request => REST API calls)
  - registering workflows


## Documentation

* Child workflows use "control" as step name


## TODO

* Document Decider API

* 500 events only ! => TODO: add a method to get more events from the history (slows down the decision process, create child workflows if possible)


## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)

