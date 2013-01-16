/**
 * MTurk
 * https://github.com/jefftimesten/mturk
 *  BUT requires neyric's branch : https://github.com/neyric/mturk
 **/

var fs = require('fs');



/**
 * Save a hash shortToken => taskToken, because
 * requesterAnnotation is limited in size (and taskToken is too long for it)
 */
function saveTaskToken(shortToken, taskToken, cb) {
   fs.readFile( __dirname + '/hits.json', function(err, data){
      if(err) {
         cb(err);
         return;
      }
               
      var hits = JSON.parse(data);

      hits[ shortToken ] = taskToken;
               
      fs.writeFile(__dirname+'/hits.json', JSON.stringify(hits), function(err) {
         if(err) { 
            cb(err);
            return; 
         }
         console.log("Hit written to file !");
      });
               
   });
}

/**
 * Return the XML for an externalUrl HIT
 */
function externalUrlXml(url, frameHeight) {
   return '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">' +
          '<ExternalURL>' + url + '</ExternalURL>' +
          '<FrameHeight>' + frameHeight + '</FrameHeight>' +
          '</ExternalQuestion>';
}


function renderTemplate(input, cb) {
   var mu = require('mu2'),
       ejs = require('ejs');

   var stream = mu.renderText(input.template, input, {});

   var str = "";
   stream.on('data', function(data) { str += data; });
   stream.on('end', function() {
      fs.readFile(__dirname+'/layout.ejs', 'utf-8', function(error, content) {
         var body = ejs.render(content, {
            body: str
         });
         cb(null, body);
      });
   });
}

function uploadS3(content, config, cb) {
   var AWS = require('aws-sdk');
   AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.s3.region
   });

   var svc = new AWS.S3();

   // TODO: generate random key
   var key = 'this-is-a-test';

   svc.client.putObject({
      Bucket: 'test-aws-swf', // TODO: configurable in config
      Key: key,
      Body: content,
      ContentType: 'text/html',
      GrantRead: 'uri="http://acs.amazonaws.com/groups/global/AllUsers"'
   }, function (err, data) {
      if(err) { return cb(err); }
      cb(null, 'https://s3.amazonaws.com/test-aws-swf/'+key); // TODO: config.s3.bucket
   });
};


function templateToS3(input, config, cb) {
   renderTemplate(input, function(err, content) {
      if(err) { return cb(err); }
      uploadS3(content, config, function(err, s3url) {
         if(err) { return cb(err); }
         cb(null, s3url);
      });
   });

}

/**
 * Generates the questionXML given the various input options
 *    - questionXML raw specified
 *    - externalURL: existing URL (+frameHeight optional, default to 500)
 *    - or templating + export to S3
 */
function generateQuestionXml(input, config, cb) {

   // TODO: input.templateUrl

   if(input.template) {
      console.log("Got a template !");
      templateToS3(input, config, function(err, s3url) {
         if(err) { return cb(err); }
         console.log("Stored on S3 !", s3url);
         cb(null, externalUrlXml(s3url, input.frameHeight || 500) );
      });
      return;
   }

   if(input.externalURL) {
      cb(null, externalUrlXml(input.externalURL, input.frameHeight || 500) );
      return;
   }

   if(input.questionXML) {
      cb(null, input.questionXML);
      return;
   }

   // Error
   cb("No questionXML or externalURL or template");
}





/**
 * Create a HIT !
 */
exports.createHit = function (task, config) {

   var input = JSON.parse(task.config.input);

   var mturk = require('mturk')(config);

   var price = new mturk.Price( String(input.reward), "USD");

   var shortToken = task.config.taskToken.substr(0,200);

   // 1. Create the HITType
   mturk.HITType.create(input.title, input.description, price, input.duration, input.options, function(err, hitType) {

      if(err) {
         console.log("error", err);
         task.respondFailed(err, "");
         return;
      }

      console.log("Created HITType "+hitType.id);


      // 3. Create a HIT

      // TODO:
      //var options = {maxAssignments: input.maxAssignments || 1};

      // TODO
      var lifeTimeInSeconds = 3600; // 1 hour


      generateQuestionXml(input, config, function(err, questionXML) {

         if(err) {
            // TODO: fail
            console.log("error", err);
            task.respondFailed("HIT configuration error", "No questionXML or externalURL");
            return;
         }

         mturk.HIT.create(hitType.id, questionXML, lifeTimeInSeconds, {
            requesterAnnotation: JSON.stringify({taskToken: shortToken })
         }, function(err, hit) {
         
            if(err) { 
               console.log(err);
               task.respondFailed(err, "");
               return; 
            }

            console.log("MTURK: Hit added : "+input.title+"\n");

            saveTaskToken(shortToken, task.config.taskToken, function(err) {
               if(err) {
                  console.error(err);
                  task.respondFailed(err, "");
               }
            });
            
         });

      });


   });


   
   
};

