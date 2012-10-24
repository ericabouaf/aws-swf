
var WorkflowExecution = require('./workflow-execution').WorkflowExecution;

var Workflow = exports.Workflow = function (swfClient, config) {
    this.swfClient = swfClient;
    this.config = config;
};

Workflow.prototype = {

    // Creates a new Workflow instance and start it
    start: function (config, cb) {
        var w = new WorkflowExecution(this.swfClient, this.config);
        w.start(config, cb);
        return w;
    },

    // register the workflow
    register: function (cb) {
        this.swfClient.RegisterWorkflowType({
            "domain": this.config.domain,
            "name": this.config.workflowType.name,
            "version": this.config.workflowType.version
        }, cb);
    }

};
