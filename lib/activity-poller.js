var ActivityTask = require('./activity-task').ActivityTask;

/**
 * Class used to create an ActivityPoller
 * @class ActivityPoller
 */
var ActivityPoller = exports.ActivityPoller = function(swfClient, config, fn) {
   
   if (!config.domain || !config.taskList || !config.taskList.name) {
      throw("ActivityPoller: domain and taskList must be set");
   }
   
   this.swfClient = swfClient;
   this.config = config;
   this.fn = fn;
};

ActivityPoller.prototype = {
   
   start: function() {
      this.poll();
   },
   
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
      
      console.log(_this.config.identity+": polling for tasks on "+this.config.taskList.name+"...");
      
      this.request = this.swfClient.PollForActivityTask(o, function(err, result) {
         
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
         
         console.log(_this.config.identity+": received new activity task");
         
         var activityTask = new ActivityTask( _this.swfClient, result);
         
         _this.fn(activityTask, function(continuePolling) {
            
            if(continuePolling) {
               _this.poll();
            }
            
         });
         
      });
      
   }
   
};
