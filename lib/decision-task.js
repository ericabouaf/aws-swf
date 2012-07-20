
var DecisionTask = exports.DecisionTask = function(swfClient, config) {
   this.swfClient = swfClient;
   this.config = config;
   
   // For sending response
   this.responseSent = false;
   this.decisions = null;
};

DecisionTask.prototype = {
   
   // TODO: implement new_events: function() {}  which returns the new events since last decision task
   
   // sends the decision response to SWF
   respondCompleted: function(decisions, cb) {
      
      this.responseSent = true;
      
      this.swfClient.RespondDecisionTaskCompleted({
        "taskToken": this.config.taskToken,
        "decisions": decisions
      }, function(err, result) {
         
         if(err) { console.error("RespondDecisionTaskCompleted error : ", err, result);  }
         
         if(cb) {
            cb(err, result);
         }
         else {
            console.log(decisions.length+" decisions sent !");
         }
      });
   },
   
   respond_waiting: function(cb) {
      this.respondCompleted([], cb);
   },
   
   waiting_for: function() {
      
      // TODO: should throw an exception if any argument cannot complete anymore.... and fail the workflow
      
      this.decisions = []; // so we indeed have decisions to send...
   },
   
   
   /*************************************
    * Methods to return decisions to SWF
    ************************************/
    
   complete_workflow_execution: function(result, cb) {
      this.respondCompleted([{
         "decisionType":"CompleteWorkflowExecution",
         "CompleteWorkflowExecutionDecisionAttributes":{
            "result": result
         }
      }], cb || function(err, result) {
         if(err) { console.error(err); return; }
         console.log("Workflow marked as finished !");
      });
   },
   
   // alias for complete_workflow_execution
   stop: function(result, cb) {
      this.complete_workflow_execution(result, cb);
   },
   
   // details is optional (stores a simplified history)
   fail_workflow_execution: function(reason, details, cb) {
      this.respondCompleted([{
         "decisionType":"FailWorkflowExecution",
         "FailWorkflowExecutionDecisionAttributes":{
            "reason": reason,
            "details": details || JSON.stringify( this.getSimpleWorkflowHistory() )
         }
      }], cb || function(err) {
         if(err) { console.error(err); return; }
         console.log("Workflow marked as failed !");
      });
   },
   
   // alias for fail_workflow_execution
   fail: function(reason, details, cb) {
      this.fail_workflow_execution(reason, details, cb);
   },
   
   
   scheduleTaskDefaults: function(ta) {
      
      // TODO: we should be able to override these defaults :
      if(!ta.scheduleToStartTimeout) ta.scheduleToStartTimeout = "60";
      if(!ta.scheduleToCloseTimeout) ta.scheduleToCloseTimeout = "360";
      if(!ta.startToCloseTimeout) ta.startToCloseTimeout = "300";
      if(!ta.heartbeatTimeout) ta.heartbeatTimeout = "60";
      
      return ta;
   },
   
   _buildScheduleTask: function(t) {
      
      var ta = this.scheduleTaskDefaults(t);
      
      if( typeof ta.activityType == "string") {
         ta.activityType = { name: ta.activityType , version: "1.0" };
      }
      
      if( typeof ta.input != "string") {
         ta.input = JSON.stringify(ta.input);
      }
      
      if( typeof ta.taskList == "string") {
         ta.taskList = { name: ta.taskList};
      }
      
      var o = {
       "decisionType":"ScheduleActivityTask",
       "scheduleActivityTaskDecisionAttributes": ta
      }; 
      
      return o;
   },
   
   
   schedule: function( taskAttributes, options) {
      
      if(!this.decisions) {
         this.decisions = [];
      }
      
      if(typeof taskAttributes == "string") {
         options.activityId = taskAttributes;
         this.decisions.push( this._buildScheduleTask(options) );
      }
      else {
         this.decisions.push( this._buildScheduleTask(taskAttributes) );
      }
      
      /*var decisions, scheduledSteps = [];
      
      // makes it possible to schedule multiple tasks at once...
      if( Array.isArray(taskAttributes) ) {
         decisions = taskAttributes.map(function(t) {
            scheduledSteps.push(t.activityId);
            return {
             "decisionType":"ScheduleActivityTask",
             "scheduleActivityTaskDecisionAttributes": this.scheduleTaskDefaults(t)
            };
         }, this);
      }
      else {
         scheduledSteps.push(taskAttributes.activityId);
         decisions = [{
             "decisionType":"ScheduleActivityTask",
             "scheduleActivityTaskDecisionAttributes": this.scheduleTaskDefaults(taskAttributes)
         }];
      }*/
      
      /*this.respondCompleted(decisions, cb || function(err, results) {
          if(err) { console.error(err, results); return; }
          console.log("Scheduled steps: "+scheduledSteps.join(',') );
      });*/
      
   },
   
   
   
   request_cancel_activity_task: function(activityId, cb) {
      this.respondCompleted([{
         "decisionType":"RequestCancelActivityTask",
         "RequestCancelActivityTaskDecisionAttributes":{
            "activityId": activityId
         }
      }], cb);
   },
   
   cancel_workflow_execution: function(details, cb) {
      this.respondCompleted([{
         "decisionType":"CancelWorkflowExecution",
         "CancelWorkflowExecutionDecisionAttributes":{
            "details": details
         }
      }], cb);
   },
   
   
   continue_as_new_workflow_execution: function(newWorkflowAttributes, cb) {
      this.respondCompleted([{
         "decisionType":"ContinueAsNewWorkflowExecution",
         "ContinueAsNewWorkflowExecutionDecisionAttributes":newWorkflowAttributes
      }], cb);
   },
   
   record_marker: function(markerName, details, cb) {
      this.respondCompleted([{
         "decisionType":"RecordMarker",
         "RecordMarkerDecisionAttributes": {
            "markerName": markerName,
            "details": details
         }
      }], cb);
   },
   
   start_timer: function(timerId, startToFireTimeout, control, cb) {
      this.respondCompleted([{
         "decisionType":"StartTimer",
         "StartTimerDecisionAttributes": {
            "timerId": timerId,
            "startToFireTimeout": startToFireTimeout,
            "control": control
         }
      }], cb);
   },
   
   cancel_timer: function(timerId, cb) {
      this.respondCompleted([{
         "decisionType":"CancelTimer",
         "CancelTimerDecisionAttributes":{
            "timerId": timerId
         }
      }], cb);
   },
   
   signal_external_workflow_execution: function(signalAttrs, cb) {
      this.respondCompleted([{
         "decisionType":"SignalExternalWorkflowExecution",
         "SignalExternalWorkflowExecutionDecisionAttributes": signalAttrs
      }], cb);
   },
   
   request_cancel_external_workflow_execution: function(workflowId, runId, control, cb) {
      this.respondCompleted([{
         "decisionType":"RequestCancelExternalWorkflowExecution",
         "RequestCancelExternalWorkflowExecutionDecisionAttributes":{
            "workflowId": workflowId,
            "runId": runId,
            "control": control
         }
      }], cb);
   },
   
   start_child_workflow_execution: function(childWorkflowAttrs, cb) {
      this.respondCompleted([{
         "decisionType":"StartChildWorkflowExecution",
         "StartChildWorkflowExecutionDecisionAttributes": childWorkflowAttrs
      }], cb);
   },
   
   
   /*********************************************
    * Methods to query the state of the workflow
    ********************************************/
   
   _has_evenType_for_activityId: function(activityId, eventType) {
      var attributesKey = eventType.substr(0,1).toLowerCase()+eventType.substr(1)+"EventAttributes";
      return this.config.events.some(function(evt) {
         if ( evt.eventType == "ActivityTaskScheduled") {
            if( evt[attributesKey].activityId == activityId ) {
               return true;
            }
         }
      });
   },
   
    has_schedule_activity_task_failed: function() {
       for(var i = 0 ; i < this.config.events.length ; i++) {
          var evt = this.config.events[i];
          var evtType = evt.eventType;
          if ( evtType == "ScheduleActivityTaskFailed") {
             return evt;
          }
       }
       return false;
    },
    
   // returns true if the activityId started
   is_activity_started: function(activityId) {
      return this._has_evenType_for_activityId(activityId, "ActivityTaskStarted");
   },
   
   // returns true if the activityId has timed out
   has_activity_timedout: function(activityId) {
      return this._has_evenType_for_activityId(activityId, "ActivityTaskTimedOut");
   },
   
   // returns true if the activityId has failed
   has_activity_failed: function(activityId) {
      return this._has_evenType_for_activityId(activityId, "ActivityTaskFailed");
   },
   
   // returns true if the activityId is canceled
   is_activity_canceled: function(activityId) {
      return this._has_evenType_for_activityId(activityId, "ActivityTaskCanceled");
   },
   
   // returns true if the activityId is scheduled
   is_activity_scheduled: function(activityId) {
      return this._has_evenType_for_activityId(activityId, "ActivityTaskScheduled");
   },
   
   scheduled: function() {
      for(var i = 0 ; i < arguments.length ; i++) {
         if( !this.is_activity_scheduled(arguments[i]) ) {
            return false;
         }
      }
      return true;
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
   
   // alias for has_workflow_just_started
   just_started: function() {
      return this.has_workflow_just_started();
   },
   
   
   // returns true if we have a Completed event for the given activityId
   has_activity_completed: function(activityId) {
      return this.config.events.some(function(evt) {
         if ( evt.eventType == "ActivityTaskCompleted") {
            if( this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) == activityId ) {
               return true;
            }
         }
      }, this);
   },
   
   
   completed: function() {
      for(var i = 0 ; i < arguments.length ; i++) {
         if( !this.has_activity_completed(arguments[i]) ) {
            return false;
         }
      }
      return true;
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
