var events = require('events'),
    util = require('util'),
    DecisionTask = require('./decision-task').DecisionTask,
    createClient = require('./swf').createClient;

/**
 * Decider - Polls Amazon SWF for new Decision Tasks
 * emits event :
 *  - 'decisionTask' (decisionTask)
 *  - 'error' (err)
 *  - 'poll' ({identity: 'identity', taskList: 'taskList'})
 */
var Decider = function (config, swfClient) {

    events.EventEmitter.call(this);

    if (!config.domain || !config.taskList) {
        throw "Decider: domain and taskList must be set";
    }

    this.config = config;
    this.swfClient = swfClient || createClient();
};

util.inherits(Decider, events.EventEmitter);

Decider.prototype.start = function() {
    this.force_no_poll = false;
    this.poll();
};

Decider.prototype.stop = function () {
    this.force_no_poll = true;
};

Decider.prototype.poll = function () {

    if (this.force_no_poll) {
        //console.log(this.config.identity + ": force_no_poll, quitting properly...");
        return;
    }

    this.emit('poll', {
        identity: this.config.identity,
        taskList: this.config.taskList
    });

    // Copy config
    var o = {}, k;
    for (k in this.config) {
        if (this.config.hasOwnProperty(k)) {
            o[k] = this.config[k];
        }
    }

    // Poll request on AWS
    // http://docs.aws.amazon.com/amazonswf/latest/apireference/API_PollForDecisionTask.html
    var _this = this;
    this.request = this.swfClient.client.pollForDecisionTask(o, function (err, result) {

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

        var decisionTask = new DecisionTask(result, _this.swfClient);

        _this.emit('decisionTask', decisionTask);
    });

};

exports.Decider = Decider;

