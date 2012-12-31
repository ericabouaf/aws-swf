
var ActivityTask = exports.ActivityTask = function (swfClient, config) {
    this.swfClient = swfClient;
    this.config = config;
};

ActivityTask.prototype = {

    respondCompleted: function (result, cb) {

        var self = this;

        if (typeof result !== "string") {
            result = JSON.stringify(result);
        }

        this.swfClient.client.respondActivityTaskCompleted({
            taskToken: this.config.taskToken,
            result: result
        }, function (err) {

            if (err) {
                console.log("Error while sending RespondActivityTaskCompleted : ", err);
            }

            if (cb) {
                cb(err);
            } else {
                console.log(self.config.activityType.name + ": respondComplete");
            }

        });

    },

    respondFailed: function (reason, details, cb) {

        var self = this;

        var o = {
            "taskToken": this.config.taskToken
        };
        if (reason) { o.reason = reason; }
        if (details) { o.details = details; }

        this.swfClient.client.respondActivityTaskFailed(o, function (err) {

            if (err) {
                console.log("Error while sending RespondActivityTaskFailed : ", err);
            }

            if (cb) {
                cb(err);
            } else {
                console.log(self.config.activityType.name + ": respondFailed");
            }

        });

    }

};
