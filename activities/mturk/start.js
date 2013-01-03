#!/usr/bin/env node
var swf = require("../../index");
var async = require('async');
var config = require('./config');
var mturk = require('mturk')(config);
var fs = require('fs');



var swfClient = swf.createClient({
   accessKeyId: config.accessKeyId,
   secretAccessKey: config.secretAccessKey
});


// TODO: this poller is set up with auto-approval of all assignements !!!
//       we could: not auto-approve them, but send taskCompleted when all assignements are reviewed !

function taskCompleted(taskToken, results, hit) {

   var hits = JSON.parse( fs.readFileSync( __dirname+'/hits.json') );
   
   console.log("All hits : ", JSON.stringify(hits) );
   console.log("shortToken", taskToken);
   console.log("taskToken", hits[taskToken]);

   // Send the respond completed
   console.log("Sending task completed !");
   swfClient.client.respondActivityTaskCompleted({
      "taskToken": hits[taskToken],
      "result": JSON.stringify({ results: results })
   }, function(err, result) {


      console.log("Task completed response :");
      console.log(err, result);


      // remove hit from file
      console.log("remove hit from hits.json");
      delete hits[taskToken];
      fs.writeFileSync(__dirname+'/hits.json', JSON.stringify(hits) );
   
      // dispose hit:
      console.log("dispose hit");
      mturk.HIT.dispose(hit.id, function() {
         console.log("done");
      });
   
   });

}


function processSwfHit(hit, taskToken) {

   //console.log(hit);

   // maxAssignments
   var maxAssignments = parseInt(hit.maxAssignments, 10);


   // Get Assignements
   console.log("Fetching assignments...");
   hit.getAssignments({}, function(err, numResults, totalNumResults, pageNumber, assignments) {

      if(err) {
         console.log("Unable to retrieve assignments !", err);
         return;
      }

      // auto-approve all assignements with assignmentStatus === 'Submitted'
      async.forEachSeries(assignments, function(assignment, cb) {
         if(assignment.assignmentStatus === 'Submitted') {
            console.log("Approving assignment : ", assignment.id);
            assignment.approve("Thank you !", cb);
         }
         else {
            cb();
         }

      }, function(err) {
         console.log("Assignements approved !!");

         if (assignments.length === maxAssignments) {
            console.log("All assignements done !");

            var results = [];
            assignments.forEach(function(assignment) {
               results.push(assignment.answer);
            });

            taskCompleted(taskToken, results, hit);

         }

      });


  });

}


// Process for one reviewable hit
function processHit(hit) {

   // TaskToken
   var taskToken;
   if(hit.requesterAnnotation && hit.requesterAnnotation.taskToken) {
      taskToken = hit.requesterAnnotation.taskToken;
   }
   else {
      console.log("Hit not associated to a taskToken for AWS-SWF");
      return;
   }

   processSwfHit(hit, taskToken);
}


// Process for one reviewable hitId
function processHitId(hitId) {

   console.log("");
   console.log('HIT with ID ' + hitId + ' HITReviewable');

   // Retrieve the hit
   mturk.HIT.get(hitId, function(err, hit) {
      if(err) {
         console.log("Cannot retrieve this hit !");
         console.log(err);
         return;
      }
      processHit(hit);
   });

}



// Start the poller
mturk.on('HITReviewable', processHitId);
