/**
 * @class DecisionTask
 */
var DecisionTask = exports.DecisionTask = function(swfClient, config) {
   this.swfClient = swfClient;
   this.config = config;
};

DecisionTask.prototype = {
   
   respondCompleted: function(decisions, cb) {
      
      var _this = this;
      
      console.log("RespondDecisionTaskCompleted... ");
      
      this.swfClient.RespondDecisionTaskCompleted({
        "taskToken": _this.config.taskToken,
        "decisions": decisions
      }, function(err, result) {
         
         if(err) {
            console.log("RespondDecisionTaskCompleted error", err, result);
            if(cb) {
               cb(err, null);
               return;
            }
         }
         
         if(cb) {
            cb(null, result);
         }
         
      });
      
   },
   
   CompleteWorkflowExecution: function(cb) {
      
      this.respondCompleted([
            {
                "decisionType":"CompleteWorkflowExecution",
                "CompleteWorkflowExecutionAttributes":{
                  "Details": "Finished !"
                }
            }
        ], cb);
      
   }
   
};
