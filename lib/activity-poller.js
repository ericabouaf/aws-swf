var events = require('events'),
    util = require('util'),
    ActivityTask = require('./activity-task').ActivityTask,
    createClient = require('./swf').createClient;

/**
 * ActivityPoller - Polls Amazon SWF for new Activity Tasks
 * emit the 'activityTask' event
 */
var ActivityPoller = function (config, swfClient) {

    events.EventEmitter.call(this);

    if (!config.domain || !config.taskList || !config.taskList.name) {
        throw "ActivityPoller: domain and taskList must be set";
    }

    this.config = config;
    this.swfClient = swfClient || createClient();
};

util.inherits(ActivityPoller, events.EventEmitter);

ActivityPoller.prototype.start = function() {
    this.force_no_poll = false;
    this.poll();
};

ActivityPoller.prototype.stop = function() {
    this.force_no_poll = true;
};


ActivityPoller.prototype.poll = function() {

    if (this.force_no_poll) {
        //console.log(this.config.identity + ": force_no_poll, quitting properly...");
        return;
    }

    this.emit('poll', {
        identity: this.config.identity,
        taskList: this.config.taskList
    });

    // Poll request on AWS
    // http://docs.aws.amazon.com/amazonswf/latest/apireference/API_PollForActivityTask.html
    var _this = this;
    this.request = this.swfClient.client.pollForActivityTask(this.config, function (err, result) {

        if (err) {
            _this.emit('error', err);
            return;
        }

        var taskToken = result.taskToken;

        // Nothing new, re-poll:
        if (!taskToken) {
            _this.poll();
            return;
        }

        var activityTask = new ActivityTask(result, _this.swfClient);

        _this.emit('activityTask', activityTask);

    });

};

exports.ActivityPoller = ActivityPoller;
