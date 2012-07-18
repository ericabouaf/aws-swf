
var ActivityTask = exports.ActivityTask = function(swfClient, config) {
   
   this.swfClient = swfClient;
   
   this.config = config;
};

ActivityTask.prototype = {
   
   respondCompleted: function(result, cb) {
      
      if(typeof result != "string") {
         result = JSON.stringify(result);
      }
      
      this.swfClient.RespondActivityTaskCompleted({
         "taskToken": this.config.taskToken,
         "result": result
      }, function(err) {
         
         if(err) {
            console.log("Error while sending RespondActivityTaskCompleted : ", err);
         }
         
         if(cb) {
            cb(err);
         }
         
      });
      
   },
   
   respondFailed: function(reason, details, cb) {
      
      var o = {
         "taskToken": this.config.taskToken
      };
      if(reason) o.reason = reason;
      if(details) o.details = details;
      
      this.swfClient.RespondActivityTaskFailed(o, function(err) {
         
         if(err) {
            console.log("Error while sending RespondActivityTaskFailed : ", err);
         }
         
         if(cb) {
            cb(err);
         }
         
      });
         
      
   }
   
};
