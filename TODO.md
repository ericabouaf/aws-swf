
## TODO

* sub-workflows activity

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

* for activities which require a deamon, use "scripts": {"start": "node server.js"} to npm start (only mturk-hit and phantom at the moment...)

* Installation instructions: needs (git install + npm link) to have access to the activities list

* build html documentation from the activities descriptions :

   exports.terminateInstances = function() {}; ...
   exports.terminateInstances.description = {
      // json schema ?...
   };
