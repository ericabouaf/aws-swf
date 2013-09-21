var util = require('util'),
    DecisionTask = require('./decision-task').DecisionTask,
    Poller = require('./poller').Poller;

/**
 * Decider - Polls Amazon SWF for new Decision Tasks
 * emits event :
 *  - 'decisionTask' (decisionTask)
 *  - 'error' (err)
 *  - 'poll' ({identity: 'identity', taskList: 'taskList'})
 * @constructor
 * @augments Poller
 */
var Decider = exports.Decider = function (config, swfClient) {

    Poller.call(this, config, swfClient);

    if (!config.domain || !config.taskList) {
        throw "Decider: domain and taskList must be set";
    }

    this.pollMethod = "pollForDecisionTask";

};

util.inherits(Decider, Poller);

/**
 * Callback for incoming tasks
 * @param {Object} [result] configuration object for the task
 */
Decider.prototype._onNewTask = function(result) {
    var decisionTask = new DecisionTask(result, this.swfClient);
    this.emit('decisionTask', decisionTask);
};
