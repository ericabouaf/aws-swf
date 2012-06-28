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
      
      console.log(_this.config.identity+": RespondDecisionTaskCompleted... ");
      
      this.swfClient.RespondDecisionTaskCompleted({
        "taskToken": _this.config.taskToken,
        "decisions": decisions
      }, function(err, result) {
         
         if(err) {
            console.log(_this.config.identity+": RespondDecisionTaskCompleted error", err, result);
         }
         
         if(cb) cb();
         
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
