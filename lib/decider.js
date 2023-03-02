var util = require('util'),
    DecisionTask = require('./decision-task').DecisionTask,
    _ = require('lodash'),
    Poller = require('./poller').Poller;

/**
 * Decider polls Amazon SWF for new Decision Tasks
 * @constructor
 * @param {Object} config Ex: { domain: "my-domain", taskList: {name: "my-taskList"} }
 * @param {Object} [swfClient]
 * @augments Poller
 * @fires Decider#decisionTask
 * @fires Poller#poll
 * @fires Poller#error
 */
var Decider = exports.Decider = function (config, swfClient) {

    Poller.call(this, config, swfClient);

    config = this.config;
    if (!config.domain || !config.taskList) {
        throw new Error("Decider: domain and taskList must be set");
    }

    // For the Poller class
    this.pollMethod = "pollForDecisionTask";
};

util.inherits(Decider, Poller);

/**
 * Callback for incoming tasks
 * @private
 * @param {Object} [originalResult] configuration object for the task
 */
Decider.prototype._onNewTask = function(originalResult,result,_this, events) {
    //For the first call, events will not be passed.
    events = events || [];
    //Reference to the original this object.
    _this = _this || this;
    result = result || originalResult;
    events.push.apply(events,result.events);
    //If more pages are available, make call to fetch objects
    if(result.nextPageToken) {
        var pollConfig = _.clone(_this.config);
        pollConfig.nextPageToken = result.nextPageToken;
        _this.swfClient[_this.pollMethod](pollConfig, function (err, nextPageResult) {
            if (err) {
                _this.emit('error', err);
                return;
            }
            _this._onNewTask(originalResult,nextPageResult,_this,events);

        });
    } else {
        //No more pages available. Create decisionTask.
        var decisionTask = new DecisionTask(originalResult, _this.swfClient, events);
        _this.taskQueue.push(function(callback){
            decisionTask.response.onDone = function(){
                _this.logger.info({"task":decisionTask}, "decision done")
                try{
                    callback()
                }
                catch(e){
                    _this.logger.info({
                        "e":e,
                        "task":decisionTask
                    }, "How do you turn this on?")
                }
            };
            /**
            * Emitted for every decision task received from Amazon SWF
            *
            * @event Decider#decisionTask
            * @property {DecisionTask} decisionTask
            */
             _this.emit('decisionTask', decisionTask);
        });

    }

};

