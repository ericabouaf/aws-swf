
var WorkflowExecution = require('./workflow-execution').WorkflowExecution;

/**
 * Class used to start Workflows
 * @class Workflow
 */
var Workflow = exports.Workflow = function(swfClient, config) {
   
   // TODO: check mandatory parameters (domain and workflowType ?)
   
   this.swfClient = swfClient;
   this.config = config;
};

Workflow.prototype = {
   
   /**
    * Creates a new Workflow instance and start it
    * @returns {WorkflowExecution}
    */
   start: function(config, cb) {
      
      var w = new WorkflowExecution(this.swfClient, this.config);
      
      w.start(config, cb);
      
      return w;
   },
   
   /**
    * Registers a new workflow type and its configuration settings in the specified domain
    * Important: If the type already exists, then a TypeAlreadyExists fault is returned. You cannot change the configuration settings of a workflow type once it is registered and it must be registered as a new version.
    */
   registerType: function(cb) {
      this.swfClient.RegisterWorkflowType(this.config, cb);
   }
   
};
