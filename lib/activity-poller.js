var ActivityTask = require('./activity-task').ActivityTask;


var ActivityPoller = exports.ActivityPoller = function (swfClient, config, fn) {

    if (!config.domain || !config.taskList || !config.taskList.name) {
        throw "ActivityPoller: domain and taskList must be set";
    }

    this.swfClient = swfClient;
    this.config = config;
    this.fn = fn;
};

ActivityPoller.prototype = {

    start: function () {
        this.force_no_poll = false;
        this.poll();
    },

    stop: function () {
        this.force_no_poll = true;
    },

    poll: function () {

        if (this.force_no_poll) {
            console.log(this.config.identity + ": force_no_poll, quitting properly...");
            return;
        }

        var _this = this;

        console.log(this.config.identity + ": polling for tasks on " + this.config.taskList.name + "...");

        this.request = this.swfClient.client.pollForActivityTask(this.config, function (err, result) {

            if (err) {
                console.log(_this.config.identity + ": polling error", err);
                _this.poll(); // Continue polling anyway
                return;
            }

            var taskToken = result.taskToken;

            if (!taskToken) {
                // Nothing new, re-poll:
                console.log(_this.config.identity + ": Nothing new, re-poll");
                _this.poll();
                return;
            }

            console.log(_this.config.identity + ": received new activity task");

            var activityTask = new ActivityTask(_this.swfClient, result);

            _this.fn(activityTask, function (continuePolling) {

                if (continuePolling) {
                    _this.poll();
                }

            });

        });

    }

};
