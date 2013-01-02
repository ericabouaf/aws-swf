
## Major

* improve text example (from turkit): http://groups.csail.mit.edu/uid/turkit/samples/sample-writing.js

## Minor

* swf-graph: generate an image using graphviz using the decider code :
   http://graphviz-dev.appspot.com/
   digraph g{
  step1 -> step3
  step2 -> step3
  step1 [label="step1\nsleep",shape=box,style="filled,rounded"];
  step2 [label="step2\nsum",shape=box,style="filled,rounded"];
  step3 [label="step3\necho",shape=box,style="filled,rounded"];
}


* sub-workflows

* support SWF signals (timers ?)

* add default SWF options to each activity.
   Example: humantask & ec2.runInstances may have long timeouts...

* more examples (cf aws flow recipies)


## New Module Ideas

* AWS modules like EC2 for DynamoDB, S3, and SWF

* ec2 startServer method which waits for it to startup.

* merge human task and email task into one ( + provide different backends, either files or DynamoDB)

* mysql module


## Documentation

* for activities which require a deamon, use "scripts": {"start": "node server.js"} to npm start
   (only mturk-hit at the moment ?)

* Installation instructions: needs git install + npm link to have access to the activities list

* build html documentation from the activities descriptions :

   exports.terminateInstances = function() {}; ...
   exports.terminateInstances.description = {
      // json schema ?...
   };
