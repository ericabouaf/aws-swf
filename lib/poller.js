
var events = require('events'),
    createClient = require('./swf').createClient,
    async = require('async'),
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
   var self = this
   this.config = config ;
   this.pause_poller = false;
   this.logger = config.logger || console;
   delete config.logger
   this.taskLimitation = config.taskLimitation || Number.MAX_SAFE_INTEGER;
   this.intervalObject = false
   delete config.taskLimitation
   this.taskQueue = async.queue(function(queueFunc, callback){
     if (!self.pause_poller) {
       self.poll();
     }
     queueFunc(callback);
   }, this.taskLimitation);
   this.taskQueue.unsaturated = function(){
    if (self.pause_poller) {
      self.resume();
    }
   };
   this.taskQueue.saturated = function(){
    if (!self.pause_poller) {
      self.pause();
    }
   };

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

   /**
    * Handler that can be attached to termination signals<br />
    * On the first invocation calls stop() and logs an message, otherwise does nothing.<br />
    * Use it like this:
    *
    *    process.on('SIGINT', poller.stopHandler);
    *    process.on('SIGTERM', poller.stopHandler);
    */
   this.stopHandler = function (x, y, z) {
      if (!self.stop_poller) {
        self.logger.info('Stopping the poller after this request...');
        self.stop();
      }
   };
};

util.inherits(Poller, events.EventEmitter);

/**
 * Resume the poller
 */
Poller.prototype.resume = function() {
   // start new poll only if the poller was paused
   if (this.pause_poller) {
     this.pause_poller = false;
   }
};

/**
 * Pause the poller
 */
Poller.prototype.pause = function() {
   this.pause_poller = true;
};

/**
 * Start the poller
 */
Poller.prototype.start = function() {
   this.stop_poller = false;
   this.poll();
   if (!this.intervalObject) {
    this.intervalObject = setInterval(this.poll, 3000, this);
   }
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
Poller.prototype.poll = function (poller = this) {

   if (poller.stop_poller || poller.pause_poller) {
      poller.logger.info('Poller stopped or paused');
      return;
   }

   /**
    * Emitted when the poller start polling on SWF
    *
    * @event Poller#poll
    * @property {Object} pollerDetails - Identity and taskList of the poller
    */
   poller.emit('poll', {
      identity: poller.config.identity,
      taskList: poller.config.taskList
   });

   // Copy config
   var o = {}, k;
   for (k in poller.config) {
      if (poller.config.hasOwnProperty(k)) {
         o[k] = poller.config[k];
      }
   }

   // Poll request on AWS
   // http://docs.aws.amazon.com/amazonswf/latest/apireference/API_PollForDecisionTask.html
   var _this = poller;
   poller.request = poller.swfClient[poller.pollMethod](o, function (err, result) {

      if (err || !result || result === null) {
        /**
         * Emitted if an error occured during polling
         *
         * @event Poller#error
         * @property {Object} err - The error
         */
        var errorTosend = (err) ? err : new Error(`ERROR POLLING FOR ${poller.pollMethod}`);
        _this.emit('error', errorTosend);
        return;
      }

      if (result.taskToken) {
        _this._onNewTask(result);
        return;
      }
      // If no new task, re-poll
      // if (!result.taskToken) {
      //    _this.poll();
      //    return;
      // }
   });
// console.log(`RESQUEST ON POLLING`)
// console.log(poller.request.response.httpResponse)
// console.log(`END RESQUEST ON POLLING`)
};


// /**
//  * Poll Amazon WebService for new tasks in a loop.
//  * When a new task is received, will emit a 'activityTask' event.
//  * @private
//  */
// Poller.prototype.poll = function (start = false) {
//   if (start) {
//     this._poll()
//   }
//   this.PollerInterval = setInterval(this._poll, 3000, this);
// };


/**
 * Callback for incoming tasks
 * @private
 * @param {Object} [result] configuration object for the task
 * @abstract
 */
Poller.prototype._onNewTask = function(result) {
   // Implemented in sub-classes
};
