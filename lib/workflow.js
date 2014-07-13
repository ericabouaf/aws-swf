
var createClient = require('./swf').createClient,
    WorkflowExecution = require('./workflow-execution').WorkflowExecution;

/**
 * Represents an Amazon WebService Simple Workflow
 * @constructor
 * @param {Object} config
 * @param {Object} [swfClient]
 */
var Workflow = exports.Workflow = function (config, swfClient) {
    this.config = config;
    this.swfClient = swfClient || createClient();
};

Workflow.prototype = {

    /**
     * Creates a new Workflow instance and start it
     * @param {Object} config
     * @param {Function} [cb] - called once the workflow execution started
     * @returns {WorkflowExecution} workflowExecution - The new instance of the workflow execution
     */
    start: function (config, cb) {
        var w = new WorkflowExecution(this.swfClient, this.config);
        w.start(config, cb);
        return w;
    },

    /**
     * Just like `start()`, but callback passes the workflow execution with the
     * run ID with no return value
     * @param {Object} config
     * @param {Function} [cb] - called once the workflow execution started
     * @returns {WorkflowExecution} workflowExecution - The new instance of the workflow execution
     */
    startCb: function (config, cb) {
      var w = this.start(config, function (err, runId) {
        if (w)
            w.runId = runId;
        cb.call(this, err, w);
      });
    },

    /**
     * register the workflow
     * @param {Function} [cb]
     */
    register: function (cb) {
        this.swfClient.registerWorkflowType({
            "domain": this.config.domain,
            "name": this.config.workflowType.name,
            "version": this.config.workflowType.version
        }, cb);
    }

};
