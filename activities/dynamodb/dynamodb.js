
var AWS = require('aws-sdk');


function makeFct(name) {

   return function (task, config) {

      AWS.config.update({
         accessKeyId: config.accessKeyId,
         secretAccessKey: config.secretAccessKey,
         region: config.region
      });

      var params = JSON.parse(task.config.input);

      var svc = new AWS.DynamoDB();

      svc.client[name](params, function (err, data) {
         if (err) {
            console.log(err); // an error occurred
            task.respondFailed('Error during the DynamoDB call', err);

         } else {
            // successful response
            // console.log( JSON.stringify(data, null, 3) );
            task.respondCompleted(data);
         }
      });

   };

}

[
   "batchGetItem",
   "batchWriteItem",
   "createTable",
   "deleteItem",
   "deleteTable",
   "describeTable",
   "getItem",
   "listTables",
   "putItem",
   "query",
   "scan",
   "updateItem",
   "updateTable"
].forEach(function(n) {
   exports[n] = makeFct(n);
});
