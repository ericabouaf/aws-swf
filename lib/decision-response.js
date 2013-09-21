
var createClient = require('./swf').createClient;

/**
 * This class makes it easier to build decision responses
 * @constructor
 */
var DecisionResponse = exports.DecisionResponse = function (swfClient, taskToken, defaultTaskList) {

   this.swfClient = swfClient || createClient();
   this.taskToken = taskToken;
   this.defaultTaskList = defaultTaskList;

   // For sending response
   this.responseSent = false;
   this.decisions = null;
   
};


DecisionResponse.prototype = {


   /**
    * sends the decision response to SWF
    */
   respondCompleted: function (decisions, cb) {

      if (this.responseSent) {
         throw "Response has already been sent for this decision task !";
      }
      this.responseSent = true;

      
      this.swfClient.client.respondDecisionTaskCompleted({
         "taskToken": this.taskToken,
         "decisions": decisions
      }, function (err, result) {

         if (err) { console.error("RespondDecisionTaskCompleted error : ", err, result);  }

         if (cb) {
            cb(err, result);
         } else {
            console.log(decisions.length + " decisions sent !");
            console.log(JSON.stringify(decisions, null, 3));
         }
      });
   },


   /**
    * Add a decision
    */
   addDecision: function(decision) {

      if (!this.decisions) {
         this.decisions = [];
      }

      this.decisions.push(decision);
   },



   /**
    * Add a "CompleteWorkflowExecution" decision
    */
   stop: function (stopAttributes, swfAttributes) {

      // If schedule conditions are not met
      /*if(!this.check_conditions(stopAttributes)) {
         return;
      }*/

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
    * details is optional (stores a simplified history)
    */
   fail_workflow_execution: function (reason, details, cb) {
      this.respondCompleted([{
         "decisionType": "FailWorkflowExecution",
         "failWorkflowExecutionDecisionAttributes": {
            "reason": reason,
            "details": details/* || JSON.stringify(this.getSimpleWorkflowHistory())*/
         }
      }], cb || function (err) {
         if (err) { console.error(err); return; }
         console.log("Workflow marked as failed ! (decision task)");
      });
   },


   /**
    * alias for fail_workflow_execution
    */
   fail: function (reason, details, cb) {
      this.fail_workflow_execution(reason, details, cb);
   },


   /**
    * Add a new ScheduleActivityTask decision
    */
    schedule: function (scheduleAttributes, swfAttributes) {

      // If schedule conditions are not met
      /*if(!this.check_conditions(scheduleAttributes)) {
         return;
      }*/

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
      if (!ta.taskList) {
         ta.taskList = this.defaultTaskList;
      }
      if (typeof ta.taskList === "string") {
         ta.taskList = { name: ta.taskList};
      }

      // TODO: we should be able to override these defaults :
      if (!ta.scheduleToStartTimeout) { ta.scheduleToStartTimeout = "60"; }
      if (!ta.scheduleToCloseTimeout) { ta.scheduleToCloseTimeout = "360"; }
      if (!ta.startToCloseTimeout) { ta.startToCloseTimeout = "300"; }
      if (!ta.heartbeatTimeout) { ta.heartbeatTimeout = "60"; }

      this.addDecision({
         "decisionType": "ScheduleActivityTask",
         "scheduleActivityTaskDecisionAttributes": ta
      });
   },


   /**
    * Add a StartChildWorkflowExecution decision
    */
   start_childworkflow: function(startAttributes, swfAttributes) {

      // If schedule conditions are not met
      /*if(!this.check_conditions(startAttributes)) {
         return;
      }*/

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
    */
   start_timer: function(startAttributes, swfAttributes) {

      // If schedule conditions are not met
      /*if(!this.check_conditions(startAttributes)) {
         return;
      }*/

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
   } //,


   /**
    * Check if a set of conditions is met
    * Currently only handles conditions.after
    */
   /*check_conditions: function(deciderParams) {

      // If activity/workflow/timer has already been scheduled/started...
      if( deciderParams.name ) {
         if(this.is_activity_scheduled(deciderParams.name) ||
            this.childworkflow_scheduled(deciderParams.name) ||
            this.timer_scheduled(deciderParams.name) ) {
               return false;
         }
      }

      // 1. checks for the 'after' control helper

      var afterCdts = deciderParams.after, o;
        
      if(typeof afterCdts === "undefined") {
         // do nothing
      }
      // After = 'step1' => checks that step1 is completed
      else if(typeof afterCdts === "string") {
         o = {};
         o[afterCdts] = 1;
         afterCdts = o;
      }
      else if( Array.isArray(afterCdts) ) {
         o = {};
         afterCdts.forEach(function(s) {
            o[s] = 1;
         });
         afterCdts = o;
      }

      for(var cdtName in afterCdts) {
         var condition = afterCdts[cdtName];
         if(condition === 1 //COMPLETED
             && !this.completed(cdtName) ) {
            // waiting on cdtName to complete...
            if (!this.decisions) {
               this.decisions = []; // so we don't stop...
            }
            return false;
         }
      }

      // 2. 'condition' function helper
      if (typeof deciderParams.condition == 'function' ) {
         if( !deciderParams.condition() ) {
            return false;
         }
      }

      return true;
   }*/

};
