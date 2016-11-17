var util = require('util'),
    ActivityTask = require('./activity-task').ActivityTask,
    Poller = require('./poller').Poller;

/**
 * Polls Amazon SWF for new Activity Tasks
 * @constructor
 * @param {Object} config Ex: { domain: "my-domain", taskList: {name: "my-taskList"} }
 * @param {Object} [swfClient]
 * @augments Poller
 * @fires ActivityPoller#activityTask
 * @fires Poller#poll
 * @fires Poller#error
 */
var ActivityPoller = exports.ActivityPoller = function (config, swfClient) {

    Poller.apply(this, arguments);

    config = this.config;
    if (!config.domain || !config.taskList || !config.taskList.name) {
        throw new Error("ActivityPoller: domain and taskList must be set");
    }

    // For the Poller class
    this.pollMethod = "pollForActivityTask";

};

util.inherits(ActivityPoller, Poller);



ActivityPoller.prototype._onNewTask = function(result) {
    var activityTask = new ActivityTask(result, this.swfClient);

    /**
     * Emitted for every activity task received from Amazon SWF
     *
     * @event ActivityPoller#activityTask
     * @property {ActivityTask} activityTask
     */
    var self = this
    this.taskQueue.push(function(callback){
        activityTask.onDone = function(){
            self.logger.info({"task":activityTask}, "activity done")
            try{
                callback()
            }
            catch(e){
                self.logger.info({
                    "e":e,
                    "task":activityTask
                }, "How do you trun this on?")
            }
        };
        self.emit('activityTask', activityTask);
    });


};
