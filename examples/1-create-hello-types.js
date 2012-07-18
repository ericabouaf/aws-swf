var swf = require("../index");
var swfClient = swf.createClient();

// Register Domain
swfClient.RegisterDomain({
   name: "node-swf-examples",
   workflowExecutionRetentionPeriodInDays: "1"
}, function(err, result) {
   
   if(err) console.log("error", JSON.stringify(err) );
   else console.log("RegisterDomain result", JSON.stringify(result));
   
   // RegisterActivityType
   swfClient.RegisterActivityType({
      "domain": "node-swf-examples",
      "name": "hello-activity",
      "version": "1.0"
   }, function(err, result) {

      if(err) console.log("error", JSON.stringify(err) );
      else console.log("RegisterActivityType result", JSON.stringify(result));

      // RegisterWorkflowType
      swfClient.RegisterWorkflowType({
         "domain": "node-swf-examples",
         "name": "hello-workflow",
         "version": "1.0"
      }, function(err, result) {

         if(err) console.log("error", JSON.stringify(err) );
         else console.log("RegisterWorkflowType result", JSON.stringify(result));

      });

   });
   
   
});

