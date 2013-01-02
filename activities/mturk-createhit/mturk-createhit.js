/**
 * MTurk
 * https://github.com/jefftimesten/mturk
 *  BUT requires neyric's branch : https://github.com/neyric/mturk
 **/

var fs = require('fs');

exports.worker = function (task, config) {


   var input = JSON.parse(task.config.input);

   var mturk = require('mturk')(config);



   var price = new mturk.Price( String(input.reward), "USD");

   var shortToken = task.taskToken.substr(0,200);


   // 1. Create the HITType
   mturk.HITType.create(input.title, input.description, price, input.duration, input.options, function(err, hitType) {

      if(err) {
         console.log("error", err);
         task.respondFailed(err, "");
         return;
      }

      console.log("Created HITType "+hitType.id);


      // 3. Create a HIT
      var options = {maxAssignments: 1};
      var lifeTimeInSeconds = 3600; // 1 hour
      mturk.HIT.create(hitType.id, input.questionXML, lifeTimeInSeconds, {
         requesterAnnotation: JSON.stringify({taskToken: shortToken })
      }, function(err, hit) {
         
            if(err) { 
               console.log(err);
               task.respondFailed(err, "");
               return; 
            }

            console.log("MTURK: Hit added !\n");


            fs.readFile( __dirname+'/hits.json', function(err, data){
               if(err) {
                  console.error("Could not open file: %s", err);
                  process.exit(1);
               }
               
               var hits = JSON.parse(data);
               
               hits[ shortToken ] = task.taskToken;
               
               fs.writeFile(__dirname+'/hits.json', JSON.stringify(hits), function(err) {
                  if(err) { 
                     console.log(err);
                     task.respondFailed(err, "");
                     return; 
                  }
                  console.log("Hit written to file !");
               });
               
            });
      });


   });


   
   
};

