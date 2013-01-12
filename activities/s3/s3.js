
var AWS = require('aws-sdk');


function makeFct(name) {

   return function (task, config) {

      AWS.config.update({
         accessKeyId: config.accessKeyId,
         secretAccessKey: config.secretAccessKey,
         region: config.region
      });

      var params = JSON.parse(task.config.input);

      var svc = new AWS.S3();

      svc.client[name](params, function (err, data) {
         if (err) {
            console.log(err); // an error occurred
            task.respondFailed('Error during the S3 call', err);

         } else {
            // successful response
            // console.log( JSON.stringify(data, null, 3) );
            task.respondCompleted(data);
         }
      });

   };

}

[
   "abortMultipartUpload",
   "completeMultipartUpload",
   "copyObject",
   "createBucket",
   "createMultipartUpload",
   "deleteBucket",
   "deleteBucketCors",
   "deleteBucketLifecycle",
   "deleteBucketPolicy",
   "deleteBucketTagging",
   "deleteBucketWebsite",
   "deleteObject",
   "deleteObjects",
   "getBucketAcl",
   "getBucketCors",
   "getBucketLifecycle",
   "getBucketLocation",
   "getBucketLogging",
   "getBucketNotification",
   "getBucketPolicy",
   "getBucketRequestPayment",
   "getBucketTagging",
   "getBucketVersioning",
   "getBucketWebsite",
   "getObject",
   "getObjectAcl",
   "getObjectTorrent",
   "headBucket",
   "headObject",
   "listBuckets",
   "listMultipartUploads",
   "listObjectVersions",
   "listObjects",
   "listParts",
   "putBucketAcl",
   "putBucketCors",
   "putBucketLifecycle",
   "putBucketLogging",
   "putBucketNotification",
   "putBucketPolicy",
   "putBucketRequestPayment",
   "putBucketTagging",
   "putBucketVersioning",
   "putBucketWebsite",
   "putObject",
   "putObjectAcl",
   "restoreObject",
   "uploadPart",
   "uploadPartCopy"
].forEach(function(n) {
   exports[n] = makeFct(n);
});
