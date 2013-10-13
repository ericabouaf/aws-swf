
var events = require('events'),
    createClient = require('./swf').createClient,
    util = require('util');

/**
 * Abstract class for the Amazon Simple Workflow polling mechanism
 * @constructor
 * @augments events.EventEmitter
 * @abstract
 */
var Poller = exports.Poller = function(config, swfClient) {

   events.EventEmitter.call(this);

   /**
    * Configuration object for the poller
    * @type Object
    */
   this.config = config;

   /**
    * Client Instance to access Simple Workflow (from aws-sdk)
    * @type AWS.SimpleWorkflow
    */
   this.swfClient = swfClient || createClient();

   /**
    * Name of the polling method to call on the swfClient
    * @type string
    * @abstract
    */
   this.pollMethod = "abstract";
};

util.inherits(Poller, events.EventEmitter);

/**
 * Start the poller
 */
Poller.prototype.start = function() {
   this.stop_poller = false;
   this.poll();
};

/**
 * Stops the poller
 * IMPORTANT: the poller won't be stopped immediately !
 * It will wait for the end of the long query poll before leaving, so that no ActivityTask gets "lost".
 */
Poller.prototype.stop = function () {
   this.stop_poller = true;
};

/**
 * Poll Amazon WebService for new tasks in a loop.
 * When a new task is received, will emit a 'activityTask' event.
 */
Poller.prototype.poll = function () {

   if (this.stop_poller) {
      //console.log(this.config.identity + ": stop_poller, quitting properly...");
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
   this.request = this.swfClient.client[this.pollMethod](o, function (err, result) {

      if (err) {
         _this.emit('error', err);
         return;
      }

      // If no new task, re-poll
      if (!result.taskToken) {
         _this.poll();
         return;
      }

      try {
        _this._onNewTask(result);
      }
      finally {
        _this.poll();
      }
   });

};

/**
 * Callback for incoming tasks
 * @param {Object} [result] configuration object for the task
 * @abstract
 */
Poller.prototype._onNewTask = function(result) {
   // Implemented in sub-classes
};
