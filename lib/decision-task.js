
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
