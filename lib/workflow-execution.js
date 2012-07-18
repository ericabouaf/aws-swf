
var WorkflowExecution = exports.WorkflowExecution = function(swfClient, baseConfig) {
   
   // TODO: check mandatory parameters (domain and workflowType ?)
   
   this.swfClient = swfClient;
   this.baseConfig = baseConfig;
};

WorkflowExecution.prototype = {
   
   start: function(config, cb) {
      
      var o = {}, k;
      
      for(k in this.baseConfig) {
         o[k] = this.baseConfig[k];
      }
      
      for(k in config) {
         o[k] = config[k];
      }
      
      if(!o.workflowId) {
         o.workflowId = (Math.random()+"").substr(2);
      }
      
      this.workflowId = o.workflowId;
      
      // TODO: check if input more than the Maximum length of 32768.
      
      this.swfClient.StartWorkflowExecution(o, function(err, result) {
         
         if(err) { 
            //console.log("error", err); 
            if(cb) {
               cb(err, null);
            }
         }
         else {
            if(cb) {
               cb(null, result.runId);
            }
         }
         
      });
   },
   
   signal: function(config, cb) {
      
      var o = {}, k;
      o.domain = this.baseConfig.domain;
      o.workflowId = this.workflowId;
      
      for(k in config) {
         o[k] = config[k];
      }
      
      this.swfClient.SignalWorkflowExecution(o, cb);
   },
   
   terminate: function(config, cb) {
      
      var o = {}, k;
      o.domain = this.baseConfig.domain;
      o.workflowId = this.workflowId;
      
      for(k in config) {
         o[k] = config[k];
      }
      
      this.swfClient.TerminateWorkflowExecution(o, cb);
   },
   
   getHistory: function(config, cb) {
      
      var o = {}, k;
      o.domain = this.baseConfig.domain;
      //o.execution = this.workflowId;
      
      for(k in config) {
         o[k] = config[k];
      }
      
      this.swfClient.GetWorkflowExecutionHistory(o, cb);
   }
   
   
};
