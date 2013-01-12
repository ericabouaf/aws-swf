## TODO

* support SWF signals (timers ?)

* use nextPageToken to get the full list of events if greater than 100

* retry on activities

* add default SWF options to each workflow

* add default SWF options to each activity.
   Example: humantask & ec2.runInstances may have long timeouts...

* more examples (cf aws flow recipies)

* multiple providers for activities (instead of single config...)


## New Module Ideas

* merge human task and email task into one ( + provide different backends, either files or DynamoDB)

* mysql module

* WebDriver activity (WIP)

* ec2 startServer method which waits for it to startup.

## Documentation

* DecisionTask API

* Document that Child workflows use "control" as step name

* for activities which require a deamon, use "scripts": {"start": "node server.js"} to npm start (only mturk-hit and phantom at the moment...)

* Document multi-activity package: 'ec2_runInstances' -> require('ec2').runInstances

* Installation instructions: needs (git install + npm link) to have access to the activities list

* build html documentation from the activities descriptions :

   exports.terminateInstances = function() {}; ...
   exports.terminateInstances.description = {
      // json schema ?...
   };

