
var ActivityTask = exports.ActivityTask = function(swfClient, config) {
   
   // TODO: check mandatory parameters (taskToken)
   
   this.swfClient = swfClient;
   this.config = config;
   
};

ActivityTask.prototype = {
   
   respondCompleted: function(result, cb) {
      
      var _this = this;
      
      if(typeof result != "string") {
         result = JSON.stringify(result);
      }
      
      this.swfClient.RespondActivityTaskCompleted({
         "taskToken": this.config.taskToken,
         "result": result
      }, function(err, response) {
         
         if(err) {
            console.log("Error while sending RespondActivityTaskCompleted : ", err); // TODO: cb(err)
         }
         
         if(cb) {
            cb();
         }
         
      });
      
   },
   
   
   respondFailed: function(reason, details) {
      
      var _this = this;
      
      var o = {
         "taskToken": this.config.taskToken
      };
      if(reason) o.reason = reason;
      if(details) o.details = details;
      
      this.swfClient.RespondActivityTaskCompleted(o, function(err, response) {
         
         if(err) {
            console.log("Error while sending RespondActivityTaskFailed : ", err); // TODO: cb(err)
         }
         
         if(cb) {
            cb();
         }
         
      });
         
      
   }
   
};
