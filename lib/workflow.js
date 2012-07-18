
var WorkflowExecution = require('./workflow-execution').WorkflowExecution;

var Workflow = exports.Workflow = function(swfClient, config) {
   
   this.swfClient = swfClient;

   this.config = config;
};

Workflow.prototype = {
   
   // Creates a new Workflow instance and start it
   start: function(config, cb) {
      
      var w = new WorkflowExecution(this.swfClient, this.config);
      
      w.start(config, cb);
      
      return w;
   },
   

   registerType: function(cb) {
      this.swfClient.RegisterWorkflowType(this.config, cb);
   }
   
};
