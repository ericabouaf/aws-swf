
var createClient = require('./swf').createClient;

/**
 * Class to make it easier to respond to activity tasks
 * @constructor
 */
var ActivityTask = exports.ActivityTask = function (config, swfClient) {
    
    this.config = config;

    this.swfClient = swfClient || createClient();
};

ActivityTask.prototype = {

    /**
     * Sends a "RespondActivityTaskCompleted" to AWS.
     * result will get stringified in JSON if not a string
     */
    respondCompleted: function (result, cb) {

        var self = this;

        if(result) {
            if (typeof result !== "string") {
                result = JSON.stringify(result);
            }
        }
        else {
            result = "";
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
            }

        });

    },


    /**
     * Sends a "RespondActivityTaskFailed" to AWS.
     */
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
            }

        });

    }

};
