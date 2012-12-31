/**
 * MTurk
 * https://github.com/pgte/mturk
 *  BUT requires neyric's branch : https://github.com/neyric/mturk
 **/

var fs = require('fs');


exports.worker = function (task, config) {

   var input = JSON.parse(task.config.input);
    
   var mturk = require('mturk')({
       url: config.url,
       accessKeyId: config.accessKeyId,
       secretAccessKey: config.secretAccessKey
   });


   // Create Hittype
   mturk.HITType.create(input.title, 
                        input.desc, 
                        { Amount: String(input.reward), CurrencyCode: 'USD', FormattedPrice: '$'+String(input.reward) }, 
                        input.alloted, 
                        {}, 
                        function(err, hittype) {
         if(err) {
            console.log("error", err);
            return;
         }
         console.log("Hittype added ! ");


         var question = new mturk.Question(__dirname+'/questionform.xml.jade', input.questionData);

         var shortToken = task.taskToken.substr(0,200);

         console.log("MTURK creating hit...");
         
         // Create the hit
         mturk.HIT.create(hittype.id, question, input.alloted, {
            requesterAnnotation: JSON.stringify({taskToken: shortToken })

         }, function(err, hit) {

            if(err) { 
               // TODO: TASK FAILED
               console.log(err);
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
                     //cb(err); 
                     console.log(err);
                     return; 
                  }
                  console.log("Hit written to file !");
               });
               
            });

         });


   });

   
   
   
};

