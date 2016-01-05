
var createClient = require('./swf').createClient;
var utils = require('./utils-factory');

/**
 * Class to make it easier to respond to activity tasks
 * @constructor
 * @param {Object} config - Object containing the taskToken from SWF
 * @param {Object} [swfClient]
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


    _respond: function(opName, params, cb){
        var self = this;
        var op = this.swfClient[opName]
        operation = utils.getRetryHelper()
        operation.attempt(function(){
            op(params,function (err, result) {
                  if (operation.retry(err)) {
                    return;
                  }
                  self.onDone();
                  if (cb) {
                    cb(err ? operation.mainError() : null, result);
                  }
                }
            );
      })
    },

    respondCanceled: function (details, cb){
        var params ={
            "taskToken":this.config.taskToken,
            "details":details
        }
        _respond("respondActivityTaskCanceled", params, cb)
    },
    /**
     * Sends a "RespondActivityTaskCompleted" to AWS.
     * @param {Mixed} result - Result of the activity (will get stringified in JSON if not a string)
     * @param {Function} [cb] - callback
     */
    respondCompleted: function (result, cb) {
        var params ={
            "result": stringify(result),
            "taskToken": this.config.taskToken
        }
        _respond("respondActivityTaskCompleted", params, cb)
    },


    /**
     * Sends a "RespondActivityTaskFailed" to AWS.
     * @param {String} reason
     * @param {String} details
     * @param {Function} [cb] - callback
     */
    respondFailed: function (reason, details, cb) {
        var self = this;
        var o = {
            "taskToken": this.config.taskToken
        };
        if (reason) {
            o.reason = reason;
        }
        if (details) {
            o.details = stringify(details);
        }
        _respond("respondActivityTaskFailed", o, cb)

    },

    /**
     * Sends a heartbeat to AWS. Needed for long run activity
     * @param {Mixed} heartbeat - Details of the heartbeat (will get stringified in JSON if not a string)
     * @param {Function} [cb] - callback
     */
    recordHeartbeat: function (heartbeat, cb) {
        var self = this;
        this.swfClient.recordActivityTaskHeartbeat({
            taskToken: this.config.taskToken,
            details: stringify(heartbeat)
        }, function (err) {
            if (cb) {
                cb(err);
            }

        });
    }

};
