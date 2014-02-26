
var createClient = require('./swf').createClient;

/**
 * Class to make it easier to respond to activity tasks
 * @constructor
 */
var ActivityTask = exports.ActivityTask = function (config, swfClient) {
    
    this.config = config;

    this.swfClient = swfClient || createClient();
};

function stringify(str) {
    if(!str) {
        return "";
    }

    if (typeof str !== "string") {
        return JSON.stringify(str);
    }

    return str;
}

ActivityTask.prototype = {

    /**
     * Sends a "RespondActivityTaskCompleted" to AWS.
     * result will get stringified in JSON if not a string
     */
    respondCompleted: function (result, cb) {

        this.swfClient.client.respondActivityTaskCompleted({
            taskToken: this.config.taskToken,
            result: stringify(result)
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

        var o = {
            "taskToken": this.config.taskToken
        };
        if (reason) {
            o.reason = reason;
        }
        if (details) {
            o.details = stringify(details);
        }

        this.swfClient.client.respondActivityTaskFailed(o, function (err) {

            if (err) {
                console.log("Error while sending RespondActivityTaskFailed : ", err);
            }

            if (cb) {
                cb(err);
            }

        });

    },

    /**
     * Sends a heartbeat to AWS. Needed for long run activity
     *
     * Heartbeat message will get stringified in JSON if not a string
     */
    recordHeartbeat: function (heartbeat, cb) {

        this.swfClient.client.recordActivityTaskHeartbeat({
            taskToken: this.config.taskToken,
            details: stringify(heartbeat)
        }, function (err) {

            if (err) {
                console.log("Error while sending RecordActivityTaskHeartbeat : ", err);
            }

            if (cb) {
                cb(err);
            }

        });
    }

};
