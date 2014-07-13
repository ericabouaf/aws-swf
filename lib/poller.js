
var events = require('events'),
    createClient = require('./swf').createClient,
    util = require('util');

/**
 * Abstract class for the Amazon Simple Workflow polling mechanism
 * @constructor
 * @augments events.EventEmitter
 * @abstract
 * @fires Poller#poll
 * @fires Poller#error
 */
var Poller = exports.Poller = function(config, swfClient) {

   events.EventEmitter.call(this);

   /**
    * Configuration object for the poller
    * @private
    * @type Object
    */
   this.config = config;

   /**
    * Client Instance to access Simple Workflow (from aws-sdk)
    * @private
    * @type AWS.SimpleWorkflow
    */
   this.swfClient = swfClient || createClient();

   /**
    * Name of the polling method to call on the swfClient
    * @private
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
 * Stops the poller<br />
 * IMPORTANT: the poller won't be stopped immediately !<br />
 * It will wait for the end of the long query poll before leaving, so that no ActivityTask gets "lost".
 */
Poller.prototype.stop = function () {
   this.stop_poller = true;
};

/**
 * Poll Amazon WebService for new tasks in a loop.
 * When a new task is received, will emit a 'activityTask' event.
 * @private
 */
Poller.prototype.poll = function () {

   if (this.stop_poller) {
      //console.log(this.config.identity + ": stop_poller, quitting properly...");
      return;
   }

   /**
    * Emitted when the poller start polling on SWF
    *
    * @event Poller#poll
    * @property {Object} pollerDetails - Identity and taskList of the poller
    */
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
   this.request = this.swfClient[this.pollMethod](o, function (err, result) {

      if (err) {
        /**
         * Emitted if an error occured during polling
         *
         * @event Poller#error
         * @property {Object} err - The error
         */
         _this.emit('error', err);
         return;
      }

      // If no new task, re-poll
      if (!result.taskToken) {
         _this.poll();
         return;
      }

      _this._onNewTask(result);
      _this.poll();
   });

};

/**
 * Callback for incoming tasks
 * @private
 * @param {Object} [result] configuration object for the task
 * @abstract
 */
Poller.prototype._onNewTask = function(result) {
   // Implemented in sub-classes
};
