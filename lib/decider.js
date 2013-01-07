var DecisionTask = require('./decision-task').DecisionTask;

var Decider = exports.Decider = function (swfClient, config, deciderFn) {

    this.swfClient = swfClient;
    this.config = config;
    this.deciderFn = deciderFn;

    this.force_no_poll = false;

    this.poll();
};

Decider.prototype = {

    stop: function () {
        this.force_no_poll = true;
    },

    poll: function () {

        if (this.force_no_poll) {
            console.log(this.config.identity + ": force_no_poll, quitting properly...");
            return;
        }

        var _this = this;

        var o = {}, k;
        for (k in this.config) {
            if (this.config.hasOwnProperty(k)) {
                o[k] = this.config[k];
            }
        }

        console.log(_this.config.identity + ": polling for decision tasks...");

        this.request = this.swfClient.client.pollForDecisionTask(o, function (err, result) {

            if (err) {
                console.log(_this.config.identity + ": polling error", err);
                _this.poll(); // Continue polling anyway ?
                return;
            }

            var taskToken = result.taskToken;

            if (!taskToken) {
                // Nothing new, re-poll:
                console.log(_this.config.identity + ": Nothing new, re-poll");
                _this.poll();
                return;
            }

            console.log(_this.config.identity + ": new decision task");

            var decisionTask = new DecisionTask(_this.swfClient, result);

            _this.deciderFn(decisionTask, function (continuePolling) {

                if (continuePolling) {
                    _this.poll();
                }

            });

        });

    }

};

