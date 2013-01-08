
## TODO

* DONE : sub-workflows activity
	=> realistic example with results of the workflow...

* Cleanup of the DecisionTask API




* support SWF signals (timers ?)

* add default SWF options to each workflow

* add default SWF options to each activity.
   Example: humantask & ec2.runInstances may have long timeouts...

* more examples (cf aws flow recipies)


## Module fixes

* deathbycaptcha: use deathbycaptcha2 npm package

* google-tools

* WebDriver instead of phantomjs to finish:
      https://github.com/admc/wd
      http://ariya.ofilabs.com/2012/12/phantomjs-1-8-blue-winter-rose.html?utm_source=javascriptweekly&utm_medium=email


## New Module Ideas

* AWS modules like EC2 for DynamoDB, S3, and SWF

* ec2 startServer method which waits for it to startup.

* merge human task and email task into one ( + provide different backends, either files or DynamoDB)

* mysql module

## Documentation

* Decision task API

* for activities which require a deamon, use "scripts": {"start": "node server.js"} to npm start (only mturk-hit and phantom at the moment...)

* Installation instructions: needs (git install + npm link) to have access to the activities list

* build html documentation from the activities descriptions :

   exports.terminateInstances = function() {}; ...
   exports.terminateInstances.description = {
      // json schema ?...
   };
