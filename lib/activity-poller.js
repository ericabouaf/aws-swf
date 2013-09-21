var util = require('util'),
    ActivityTask = require('./activity-task').ActivityTask,
    Poller = require('./poller').Poller;

/**
 * ActivityPoller - Polls Amazon SWF for new Activity Tasks
 * emits event :
 *  - 'activityTask' (activityTask)
 *  - 'error' (err)
 *  - 'poll' ({identity: 'identity', taskList: 'taskList'})
 * @constructor
 * @augments Poller
 */
var ActivityPoller = exports.ActivityPoller = function (config, swfClient) {

    Poller.apply(this, arguments);

    if (!config.domain || !config.taskList || !config.taskList.name) {
        throw "ActivityPoller: domain and taskList must be set";
    }

    this.pollMethod = "pollForActivityTask";

};

util.inherits(ActivityPoller, Poller);

/**
 * Callback for incoming tasks
 * @param {Object} [result] configuration object for the task
 */
ActivityPoller.prototype._onNewTask = function(result) {
    var activityTask = new ActivityTask(result, this.swfClient);
    this.emit('activityTask', activityTask);
};
