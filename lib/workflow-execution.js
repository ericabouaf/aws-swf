
/**
 * Represents an Amazon WebService Simple Workflow Execution
 * @constructor
 * @param {Object} swfClient
 * @param {Object} baseConfig
 */
var WorkflowExecution = exports.WorkflowExecution = function (swfClient, baseConfig) {
    this.swfClient = swfClient;
    this.baseConfig = baseConfig;
};

WorkflowExecution.prototype = {

    /**
     * Start a worfklow
     * @param {Object} config
     * @param {Function} cb
     */
    start: function (config, cb) {

        var o = {}, k;

        for (k in this.baseConfig) {
            if (this.baseConfig.hasOwnProperty(k)) {
                o[k] = this.baseConfig[k];
            }
        }

        for (k in config) {
            if (config.hasOwnProperty(k)) {
                o[k] = config[k];
            }
        }

        if (!o.workflowId) {
            o.workflowId = String(Math.random()).substr(2);
        }

        this.workflowId = o.workflowId;

        this.swfClient.startWorkflowExecution(o, function (err, result) {
            cb(err, result ? result.runId : null);
        });
    },

    _prepare_options: function(config) {
        var o = {}, k;
        o.domain = this.baseConfig.domain;
        o.workflowId = this.workflowId;

        for (k in config) {
            if (config.hasOwnProperty(k)) {
                o[k] = config[k];
            }
        }

        return o;
    },

    /**
     * Send a signal to the workflow execution
     * @param {Object} config
     * @param {Function} cb
     */
    signal: function (config, cb) {
        var o = this._prepare_options(config);
        this.swfClient.signalWorkflowExecution(o, cb);
    },

    /**
     * Terminate the workflow execution
     * @param {Object} config
     * @param {Function} cb
     */
    terminate: function (config, cb) {
        var o = this._prepare_options(config);
        this.swfClient.terminateWorkflowExecution(o, cb);
    },

    /**
     * Get the history for the workflow execution
     * @param {Object} config
     * @param {Function} cb
     */
    getHistory: function (config, cb) {

        var o = {}, k;
        o.domain = this.baseConfig.domain;
        //o.execution = this.workflowId;

        for (k in config) {
            if (config.hasOwnProperty(k)) {
                o[k] = config[k];
            }
        }

        this.swfClient.getWorkflowExecutionHistory(o, cb);
    }

};
