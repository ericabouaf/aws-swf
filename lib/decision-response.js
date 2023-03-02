var createClient = require('./swf').createClient;

/**
 * This class makes it easier to build decision responses.<br />
 * http://docs.aws.amazon.com/amazonswf/latest/apireference/API_Decision.html
 * @constructor
 * @param {Object} swfClient
 * @param {String} taskToken
 * @param {String} defaultTaskList
 */
var DecisionResponse = function (swfClient, taskToken, defaultTaskList) {

   this.swfClient = swfClient || createClient();
   this.taskToken = taskToken;
   this.defaultTaskList = defaultTaskList;

   // For sending response
   this.responseSent = false;
   this.decisions = null;

};

exports.DecisionResponse = DecisionResponse;

DecisionResponse.prototype = {

  /**
   * Send the stored decisions to SWF
   * @param {Function} cb - callback
   */
  send: function(cb) {
    this.respondCompleted(this.decisions, cb);
  },

   /**
    * Sends the decision response to SWF
    * @param {Array} decisions - the decisions to send
    * @param {Function} cb - callback
    */
   respondCompleted: function (decisions, cb) {
      self = this;
      if (this.responseSent) {
         throw new Error("Response has already been sent for this decision task !");
      }
      this.responseSent = true;

      this.swfClient.respondDecisionTaskCompleted({
         "taskToken": this.taskToken,
         "decisions": decisions
      }, function (err, result) {
         if (self.onDone) {
            self.onDone();
         }
         if (cb) {
            cb(err, result);
         }
      });
   },


   /**
    * Add a decision
    * @param {Object} decision - decision to add to the response
    */
   addDecision: function(decision) {

      if (!this.decisions) {
         this.decisions = [];
      }

      this.decisions.push(decision);
   },


   /**
    * Sets the local decisions to an empty array. Call this method if no decisions can be made.<br />
    */
   wait: function() {

      if (!this.decisions) {
         this.decisions = [];
      }

   },


   /**
    * Add a "CompleteWorkflowExecution" decision to the response
    * @param {Object} stopAttributes - object containing a 'result' attribute. The result value can be a function (which will get evaluated), a string, or a json object.
    * @param {Object} [swfAttributes] - Additionnal attributes for 'completeWorkflowExecutionDecisionAttributes'
    */
   stop: function (stopAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // Result
      if(stopAttributes.result) {
         if (typeof stopAttributes.result === 'function') {
            sa.result = stopAttributes.result();
         }
         else {
            sa.result = stopAttributes.result;
         }
      }
      if(typeof sa.result !== 'string') {
         sa.result = JSON.stringify(sa.result);
      }

      this.addDecision({
         "decisionType": "CompleteWorkflowExecution",
         "completeWorkflowExecutionDecisionAttributes": sa
      });

    },

   /**
    * Add a "FailWorkflowExecution" decision
    * @param {String} reason
    * @param {String} [details]
    * @param {Function} cb - callback
    */
   fail_workflow_execution: function (reason, details, cb) {

      if(!details) {
        details = "";
      }
      if(typeof details !== "string") {
        details = JSON.stringify(details);
      }

      this.respondCompleted([{
         "decisionType": "FailWorkflowExecution",
         "failWorkflowExecutionDecisionAttributes": {
            "reason": reason,
            "details": details
         }
      }], cb || function (err) {
         if (err){
            return;
          }
      });
   },


   /**
    * Alias for fail_workflow_execution
    * @param {String} reason
    * @param {String} [details]
    * @param {Function} cb - callback
    */
   fail: function (reason, details, cb) {
      this.fail_workflow_execution(reason, details, cb);
   },


   /**
    * Add a new ScheduleActivityTask decision
    * @param {Object} scheduleAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'scheduleActivityTaskDecisionAttributes'
    */
    schedule: function (scheduleAttributes, swfAttributes) {

      var ta = swfAttributes || {};

      ta.activityId = scheduleAttributes.name; // scheduleAttributes.name required

      // Activity Type
      if(scheduleAttributes.activity) {
         ta.activityType = scheduleAttributes.activity;
      }
      if (typeof ta.activityType === "string") {
         ta.activityType = { name: ta.activityType, version: "1.0" };
      }

      // Activity Input
      if (scheduleAttributes.input) {
         if (typeof scheduleAttributes.input === 'function') {
            ta.input = scheduleAttributes.input();
         }
         else {
            ta.input = scheduleAttributes.input;
         }
      }
      else {
         ta.input = "";
      }

      if (typeof ta.input !== "string") {
         ta.input = JSON.stringify(ta.input);
      }

      // Task list (if not set, use the default taskList)
      if (!ta.taskList && this.defaultTaskList) {
          ta.taskList = this.defaultTaskList;
      }
      if (ta.taskList && typeof ta.taskList === "string") {
         ta.taskList = { name: ta.taskList};
      }

      // TODO: we should be able to override these defaults :
      if (!ta.scheduleToStartTimeout) {
        ta.scheduleToStartTimeout = scheduleAttributes.scheduleToStartTimeout || "60";
      }
      if (!ta.scheduleToCloseTimeout) {
        ta.scheduleToCloseTimeout = scheduleAttributes.scheduleToCloseTimeout || "360";
      }
      if (!ta.startToCloseTimeout) {
        ta.startToCloseTimeout = scheduleAttributes.startToCloseTimeout || "300";
      }
      if (!ta.heartbeatTimeout) {
        ta.heartbeatTimeout = scheduleAttributes.heartbeatTimeout || "60";
      }

      this.addDecision({
         "decisionType": "ScheduleActivityTask",
         "scheduleActivityTaskDecisionAttributes": ta
      });
   },

   /**
    * Add a new ScheduleLambdaFunction decision
    * @param {Object} scheduleAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'scheduleActivityTaskDecisionAttributes'
    */
   schedule_lambda: function (scheduleAttributes, swfAttributes) {
      var attributes = swfAttributes || {}

      attributes.id = attributes.id || scheduleAttributes.id || String(Math.random()).substr(2)

      if (scheduleAttributes.name) {
         attributes.name = scheduleAttributes.name
      }

      if (scheduleAttributes.input) {
         attributes.input = scheduleAttributes.input
      }

      this.addDecision({
         "decisionType":"ScheduleLambdaFunction",
         "scheduleLambdaFunctionDecisionAttributes": attributes
      })
   },

   /**
    * Add a RecordMarker decision
    * @param {String} markerName
    * @param {String} [details]
    */
    add_marker: function (markerName, details) {

      if (typeof markerName !== 'string') {
         markerName = markerName.toString();
      }

      if (typeof details !== 'string') {
         details = details.toString();
      }

      this.addDecision({
         "decisionType": "RecordMarker",
         "recordMarkerDecisionAttributes": {
            "markerName": markerName,
            "details": details
         }
      });
    },


   /**
    * Add a StartChildWorkflowExecution decision
    * @param {Object} startAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'startChildWorkflowExecutionDecisionAttributes'
    */
   start_childworkflow: function(startAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // control
      sa.control = startAttributes.name;

      // workflowType
      if(startAttributes.workflow) {
         sa.workflowType = startAttributes.workflow;
      }
      if(typeof sa.workflowType === 'string') {
         sa.workflowType = {
            name: sa.workflowType,
            version: "1.0"
         };
      }

      if( !sa.input ) {
        sa.input = "";
      }

      if (typeof sa.input !== "string") {
         sa.input = JSON.stringify(sa.input);
      }

      if(!sa.workflowId) {
         sa.workflowId = String(Math.random()).substr(2);
      }

      this.addDecision({
         "decisionType": "StartChildWorkflowExecution",
         "startChildWorkflowExecutionDecisionAttributes": sa
      });
   },


   /**
    * Add a new StartTimer decision
    * @param {Object} startAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'startTimerDecisionAttributes'
    */
   start_timer: function(startAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // control
      sa.control = startAttributes.name;

      if(startAttributes.delay) {
         sa.startToFireTimeout = String(startAttributes.delay);
      }
      if(!sa.startToFireTimeout) {
         sa.startToFireTimeout = "1";
      }

      if(!sa.timerId) {
         sa.timerId = String(Math.random()).substr(2);
      }

      this.addDecision({
         "decisionType": "StartTimer",
         "startTimerDecisionAttributes": sa
      });
   },

   /**
    * Cancel a Timer
    * @param {String} timerId
    */
   cancel_timer: function(timerId) {
      this.addDecision({
         "decisionType": "CancelTimer",
         "cancelTimerDecisionAttributes": {
            "timerId": timerId.toString()
         }
      });
   },

   /**
    * Cancel an activity task
    * @param {String} activityId
    */
   request_cancel_activity_task: function (activityId) {
      this.addDecision({
         "decisionType": "RequestCancelActivityTask",
         "requestCancelActivityTaskDecisionAttributes": {
            "activityId": activityId
         }
      });
    },

   /**
    * Signal a workflow execution
    * @param {Object} [swfAttributes] - Additionnal attributes for 'signalExternalWorkflowExecutionDecisionAttributes'
    */
   signal_external_workflow: function (swfAttributes) {
      var sa = swfAttributes || {};
      this.addDecision({
        "decisionType": "SignalExternalWorkflowExecution",
        "signalExternalWorkflowExecutionDecisionAttributes": sa
      });
    },

    /**
     * Send a RequestCancelExternalWorkflowExecution
     * @param {String} workflowId
     * @param {String} runId
     * @param {String} control
     */
    request_cancel_external_workflow: function (workflowId, runId, control) {
      this.addDecision({
        "decisionType": "RequestCancelExternalWorkflowExecution",
        "requestCancelExternalWorkflowExecutionDecisionAttributes": {
            "workflowId": workflowId,
            "runId": runId,
            "control": control
        }
      });
    },

    /**
     * Cancel a workflow execution
     * @param {String} details
     */
    cancel_workflow: function (details) {
        this.addDecision({
          "decisionType": "CancelWorkflowExecution",
          "cancelWorkflowExecutionDecisionAttributes": {
            "details": details
          }
        });
    },

    /**
     * Continue as a new workflow execution
     * @param {Object} [swfAttributes] - Additionnal attributes for 'continueAsNewWorkflowExecutionDecisionAttributes'
     */
    continue_as_new_workflow: function (swfAttributes) {
      var sa = swfAttributes || {};
      this.addDecision({
        'decisionType': 'ContinueAsNewWorkflowExecution',
        'continueAsNewWorkflowExecutionDecisionAttributes': sa
      });
    }


};
