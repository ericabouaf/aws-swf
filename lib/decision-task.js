
var DecisionTask = exports.DecisionTask = function(swfClient, config) {
   this.swfClient = swfClient;
   this.config = config;
};

DecisionTask.prototype = {
   
   respondCompleted: function(decisions, cb) {
      
      var _this = this;
      
      console.log("RespondDecisionTaskCompleted... ");
      
      this.swfClient.RespondDecisionTaskCompleted({
        "taskToken": _this.config.taskToken,
        "decisions": decisions
      }, function(err, result) {
         
         if(err) {
            console.log("RespondDecisionTaskCompleted error", err, result);
         }
         
         if(cb) {
            cb(err, result);
         }
         
      });
      
   },
   
   CompleteWorkflowExecution: function(details, cb) {
      
      this.respondCompleted([
            {
                "decisionType":"CompleteWorkflowExecution",
                "CompleteWorkflowExecutionAttributes":{
                  "Details": details
                }
            }
        ], cb);
      
   },
   
   
   FailWorkflowExecution: function(reason, details, cb) {
      
      this.respondCompleted([
            {
                "decisionType":"FailWorkflowExecution",
                "FailWorkflowExecutionAttributes":{
                  "reason": reason,
                  "details": details
                }
            }
        ], cb);
      
   },
   
   
   has_ScheduleActivityTaskFailed: function() {
      for(var i = 0 ; i < this.config.events.length ; i++) {
         var evt = this.config.events[i];
         var evtType = evt.eventType;
         if ( evtType == "ScheduleActivityTaskFailed") {
            return evt;
         }
      }
      return false;
   },
   
   
   // returns true if the activityId is scheduled
   is_scheduled: function(activityId) {
      for(var i = 0 ; i < this.config.events.length ; i++) {
         var evt = this.config.events[i];
         var  evtType = evt.eventType;
         if ( evtType == "ActivityTaskScheduled") {
            if( evt.activityTaskScheduledEventAttributes.activityId == activityId ) {
               return true;
            }
         }
      }
      return false;
   },
   
   
   // returns true if no Activity has been scheduled yet...
   has_workflow_just_started: function() {
      for(var i = 0 ; i < this.config.events.length ; i++) {
         var evt = this.config.events[i];
         var  evtType = evt.eventType;
         if ( evtType == "ActivityTaskScheduled") {
            return false;
         }
      }
      return true;
   },
   
   
   // returns true if we have a Completed event for the given activityId
   has_completed: function(activityId) {
      for(var i = 0 ; i < this.config.events.length ; i++) {
         var evt = this.config.events[i];
         var  evtType = evt.eventType;
         if ( evtType == "ActivityTaskCompleted") {
            if( this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) == activityId ) {
               return true;
            }
         }
      }
      return false;
   },
   
   
   // Return the activityId
   activityIdFor: function(scheduledEventId) {
      for(var i = 0 ; i < this.config.events.length ; i++) {
         var evt = this.config.events[i];
         if(evt.eventId === scheduledEventId) {
            return evt.activityTaskScheduledEventAttributes.activityId;
         }
      }
      return false;
   },
   

   schedule: function( taskAttributes, cb) {
      // TODO: make it possible to schedule multiple tasks at once...
      /*if( Array.isArray(decisions) ) {
         
      }*/
      
      this.respondCompleted([{
          "decisionType":"ScheduleActivityTask",
          "scheduleActivityTaskDecisionAttributes": taskAttributes
      }], cb);
   },
   
   
   // experimental
   // The goal is to simplify the structure of the decider events to reason with "activities" instead
   // this function groups the events for an activity.
   getSimpleWorkflowHistory: function() {
      
      var decisionTaskConfig = this.config,
         workflowHistory = {
            activities: []
         },
         activitiesIndexByScheduledEventId = {}, 
         activity,
         activities = workflowHistory.activities;
         
      decisionTaskConfig.events.forEach(function(evt) {
         
         var  evtType = evt.eventType;
         
         if ( evtType == "WorkflowExecutionStarted") {
            workflowHistory.input = evt.workflowExecutionStartedEventAttributes.input;
         }
         else if (evtType == "DecisionTaskScheduled" || evtType == "DecisionTaskStarted" || evtType == "DecisionTaskCompleted" ) {
            // do nothing...
         }
         else if ( evtType == "ActivityTaskScheduled") { 
            activitiesIndexByScheduledEventId[evt.eventId] = activities.length;
            activities.push({
               input: evt.activityTaskScheduledEventAttributes.input,
               activityId: evt.activityTaskScheduledEventAttributes.activityId,
               lastEvent: evtType/*,
               events: [evt]*/
            });
         }
         else if ( evtType == "ActivityTaskStarted") {
            activity = activities[ activitiesIndexByScheduledEventId[evt.activityTaskStartedEventAttributes.scheduledEventId] ];
            //activity.events.push(evt);
            activity.lastEvent = evtType;
         }
         else if ( evtType == "ActivityTaskCompleted") { 
            activity = activities[ activitiesIndexByScheduledEventId[evt.activityTaskCompletedEventAttributes.scheduledEventId] ];
            //activity.events.push(evt);
            activity.lastEvent = evtType;
            activity.result = evt.activityTaskCompletedEventAttributes.result;
         }
         else if ( evtType == "ActivityTaskTimedOut") { 
            activity = activities[ activitiesIndexByScheduledEventId[evt.activityTaskTimedOutEventAttributes.scheduledEventId] ];
            //activity.events.push(evt);
            activity.lastEvent = evtType;
         }
         else if ( evtType == "ActivityTaskFailed") {
            activity = activities[ activitiesIndexByScheduledEventId[evt.activityTaskFailedEventAttributes.scheduledEventId] ];
            //activity.events.push(evt);
            activity.lastEvent = evtType;
         }
         else {
            console.log("WARNING: Unhandled event type '"+evtType+"'");
            // Want to handle other events ? => http://docs.amazonwebservices.com/amazonswf/latest/apireference/API_HistoryEvent.html
         }
      });
      
      return workflowHistory;
   }
   
};
