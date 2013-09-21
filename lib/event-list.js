
/**
 * This class provides methods to query the event list passed to the decision tasks
 * @constructor
 */
var EventList = exports.EventList = function (events) {
   this._events = events;
};



EventList.prototype = {

   /**
    * This method returns true if the eventType already occured for the given activityId
    */
   _has_eventType_for_activityId: function (activityId, eventType) {
      var attributesKey = eventType.substr(0, 1).toLowerCase() + eventType.substr(1) + "EventAttributes";
      return this._events.some(function (evt) {
         if (evt.eventType === eventType) {
            if (evt[attributesKey].activityId === activityId) {
               return true;
            }
         }
      });
   },

   /**
    * TODO
    */
   has_schedule_activity_task_failed: function () {
      // TODO: rewrite this !
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         var evtType = evt.eventType;
         if (evtType === "ScheduleActivityTaskFailed") {
            return evt;
         }
      }
      return false;
   },

   /**
    * Return true if the timer already started
    */
   timer_scheduled: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "TimerStarted") {
            if (evt.timerStartedEventAttributes.control === control) {
               return true;
            }
         }
      });
    },


   /**
    * return true if the timer has fired
    */
   timer_fired: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "TimerFired") {
            var initiatedEventId = evt.timerFiredEventAttributes.startedEventId;
            var initiatedEvent = this.eventById(initiatedEventId);

            if (initiatedEvent.timerStartedEventAttributes.control === control) {
               return true;
            }
         }
      }, this);
   },


   /**
    * lookup for StartChildWorkflowExecutionInitiated
    */
   childworkflow_scheduled: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "StartChildWorkflowExecutionInitiated") {
            if (evt.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         }
      });
   },

   /**
    * Return true if the child workflow is completed
    */
   childworkflow_completed: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "ChildWorkflowExecutionCompleted") {
            var initiatedEventId = evt.childWorkflowExecutionCompletedEventAttributes.initiatedEventId;
            var initiatedEvent = this.eventById(initiatedEventId);

            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         }
      }, this);
   },

   /**
    * returns true if the activityId started
    */
   is_activity_started: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskStarted");
   },

   /**
    * returns true if the activityId has timed out
    */
   has_activity_timedout: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskTimedOut");
   },

   /**
    * returns true if the activityId has failed
    */
   has_activity_failed: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskFailed");
   },

   /**
    * Returns true if the arguments failed
    */
   failed: function () {
      var i;
      for (i = 0; i < arguments.length; i++) {
         if (!this.failed(arguments[i])) {
            return false;
         }
      }
      return true;
   },
   
   /**
    * returns true if the activityId is canceled
    */
   is_activity_canceled: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskCanceled");
   },

   /**
    * returns true if the activityId is scheduled
    */
   is_activity_scheduled: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskScheduled");
   },


   /**
    * Return true if the arguments are all scheduled
    */
   scheduled: function () {
      var i;
      for (i = 0; i < arguments.length; i++) {
         if (!this.is_activity_scheduled(arguments[i])) {
            return false;
         }
      }
      return true;
   },

   /**
    * returns true if no Activity has been scheduled yet...
    */
   has_workflow_just_started: function () {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         var evtType = evt.eventType;
         if (evtType === "ActivityTaskScheduled") {
            return false;
         }
      }
      return true;
   },

   /**
    * alias for has_workflow_just_started
    */
   just_started: function () {
      return this.has_workflow_just_started();
   },

   /**
    * returns true if we have a Completed event for the given activityId
    */
   has_activity_completed: function (activityId) {
      return this._events.some(function (evt) {
         if (evt.eventType === "ActivityTaskCompleted") {
               if (this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) === activityId) {
                  return true;
               }
            }
      }, this);
   },

   /**
    * Return true if all the arguments are completed
    */
   completed: function () {
      var i;
      for (i = 0; i < arguments.length; i++) {
         if ( ! (this.has_activity_completed(arguments[i]) || this.childworkflow_completed(arguments[i])  || this.timer_fired(arguments[i]) ) ) {
            return false;
         }
      }
      return true;
   },

   /**
    * Return the activityId given the scheduledEventId
    */
   activityIdFor: function (scheduledEventId) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         if (evt.eventId === scheduledEventId) {
            return evt.activityTaskScheduledEventAttributes.activityId;
         }
      }
      return false;
   },


   /**
    * Return the activityId
    */
   eventById: function (eventId) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         if (evt.eventId === eventId) {
            return evt;
         }
      }
      return false;
   },

   
   /**
    * Get the input parameters of the workflow
    */
   workflow_input: function () {

      var wfInput = this._events[0].workflowExecutionStartedEventAttributes.input;
        
      try {
         var d = JSON.parse(wfInput);
         return d;
      } catch (ex) {
         return wfInput;
      }
   },


   /**
    * Get the results for the given activityId
    */
   results: function (activityId, options) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];

         if (evt.eventType === "ActivityTaskCompleted") {
            if (this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) === activityId) {

               var result = evt.activityTaskCompletedEventAttributes.result;

               if (!!options && !!options.format && options.format === "json") {
                  result = JSON.parse(result);
               }
   
               try {
                  var d = JSON.parse(result);
                  return d;
               } catch (ex) {
                  return result;
               }

            }
         }
      }

      return null;
   },

   
   /**
    * Get the results of a completed child workflow
    */
   childworkflow_results: function(control) {

      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];

         if (evt.eventType === "ChildWorkflowExecutionCompleted") {

            var initiatedEventId = evt.childWorkflowExecutionCompletedEventAttributes.initiatedEventId;
            var initiatedEvent = this.eventById(initiatedEventId);

            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {

               var result = evt.childWorkflowExecutionCompletedEventAttributes.result;

               try {
                  result = JSON.parse(result);
               }
               catch(ex) {}

               return result;
            }
         }
      }

      return null;
   }

};

