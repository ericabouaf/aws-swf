var DecisionTask = require('./decision-task').DecisionTask;


/**
 * Class used to create a Decider
 * @class Decider
 */
var Decider = exports.Decider = function(swfClient, config, deciderFn) { 
 
   // TODO: check mandatory parameters (domain and taskList ?)
 
   this.swfClient = swfClient;
   this.config = config;
   this.deciderFn = deciderFn;
   
   this.poll();
};

Decider.prototype = {
   
   stop: function() {
      this.request.abort();
      console.log(this.config.identity+": polling request aborted");
   },
   
   poll: function() {
      
      var _this = this;
      
      var o = {};
      for(var k in this.config) {
         o[k] = this.config[k];
      }
      
      console.log(_this.config.identity+": polling...");
      
      this.request = this.swfClient.PollForDecisionTask(o, function(err, result) {
         
         if(err) {
            console.log(_this.config.identity+": polling error", err);
            _this.poll(); // Continue polling anyway ?
            return;
         }
            
         var taskToken = result.taskToken;
         
         if(!taskToken) {
            // Nothing new, re-poll:
            console.log(_this.config.identity+": Nothing new, re-poll");
            _this.poll();
            return;
         }
         
         console.log(_this.config.identity+": new decision task");
         
         var decisionTask = new DecisionTask(_this.swfClient, result);
         
         _this.deciderFn(decisionTask, function(continuePolling) {
            
            if(continuePolling) {
               _this.poll();
            }
            
         });
         
      });
      
   }
   
};
