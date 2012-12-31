var swf = require("../../index");
var async = require('async');
var fs = require('fs');

var config = require(__dirname + '/config.js');

var mturk = require('mturk')({
    url: config.url,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

var swfClient = swf.createClient({
   accessKeyId: config.accessKeyId,
   secretAccessKey: config.secretAccessKey
});


function processHit(hit, cb) {
   
      
      console.log("Retrieving hit infos...");
      
      mturk.HIT.get(hit.id, function(err, hit) {
         if(err) {
            cb(err);
            return;
         }
         
         
         //console.log("HIT", hit);
         
         if(hit.requesterAnnotation && hit.requesterAnnotation.taskToken) {
         
            console.log("Hit reviewable with a taskToken : "+hit.id);
            console.log("Loading assignments...");
            
            hit.getAssignments({}, function(err, numResults, totalNumResults, pageNumber, assignments) {
               
               console.log("..got "+assignments.length);
               if(assignments.length === 0) {
                  
                  
                  
                  mturk.HIT.dispose(hit.id, function() {
                     
                     if(err) {
                        cb(err);
                     }
                     else {
                        console.log("HIT disposed !");
                        cb();
                     }
                     
                  });
                  
                  return;
               }
               
              assignments.forEach(function(assignment) {
                 
                 if(assignment.assignmentStatus == 'Approved') {
                    
                    mturk.HIT.dispose(hit.id, function() {

                       if(err) {
                          cb(err);
                       }
                       else {
                          console.log("HIT disposed !");
                          cb();
                       }

                    });
                    
                    return;
                 }
                 // TODO: assignment.assignmentStatus: 'Approved',
                 // TODO: assignment.approvalTime: '2012-06-25T16:31:33Z',
                 
                  var responses = assignment.answer.QuestionFormAnswers.Answer;
                  var results = {};
                  responses.forEach(function(r) {
                     results[r.QuestionIdentifier] = r.FreeText;
                  });
                  
                  console.log("Assignment for taskToken "+hit.requesterAnnotation.taskToken);
                  
                  var shortToken = hit.requesterAnnotation.taskToken;
                  
                  fs.readFile( __dirname+'/hits.json', function(err,data){
                    if(err) {
                      console.error("Could not open file: %s", err);
                      process.exit(1);
                    }

                    var hits = JSON.parse(data);
                     
                     console.log("Approving assignement...");

                     assignment.approve("requesterFeedback text...", function(err) {
                        
                        if(err) {
                           cb(err);
                           return;
                        }

                        console.log("Assignement approved, sending ActivityTask Completed !");
                        
                        swfClient.client.respondActivityTaskCompleted({
                           "taskToken": hits[shortToken],
                           "result": JSON.stringify( results )
                        }, function(err, result) {

                           // TODO: remove hit.
                           delete hits[shortToken];
                           fs.writeFile(__dirname+'/hits.json', JSON.stringify(hits), function(err) {
                              if(err) { 
                                 //cb(err); 
                                 console.log(err);
                                 return; 
                              }
                              console.log("Hit removed from file !");
                           });
                           
                           if(err) {
                              cb(err);
                              return;
                           }
                           
                           console.log("ActivityTask response sent !");
                           
                           cb();
                        });
                        
                     });
                     
                     
                  
                  
                  });
                  
              });
            });
            
         }
         else {
            cb();
         }



      });
   
   
};



mturk.HIT.getReviewable(undefined, function (err,  numResults,  totalNumResults,  pageNumber,  hits) {

   if(err) {
      console.log("error", err);
      return;
   }
   
   console.log("# of hits opened for review : "+hits.length );
   
   async.forEachSeries(hits, processHit, function(err) {
      if(err)
         console.log(err);
      else
         console.log("All Done !");
   });
   
});


