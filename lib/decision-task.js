
var DecisionTask = exports.DecisionTask = function (swfClient, config) {
    this.swfClient = swfClient;
    this.config = config;

    // For sending response
    this.responseSent = false;
    this.decisions = null;
};

DecisionTask.prototype = {


    // sends the decision response to SWF
    respondCompleted: function (decisions, cb) {

        if (this.responseSent) {
            throw "Response has already been sent for this decision task !";
        }

        this.responseSent = true;

        this.swfClient.client.respondDecisionTaskCompleted({
            "taskToken": this.config.taskToken,
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


    addDecision: function(decision) {

        if (!this.decisions) {
            this.decisions = [];
        }

        this.decisions.push(decision);
    },



    /*************************************
     * Methods to return decisions to SWF
     ************************************/

    stop: function (stopAttributes, swfAttributes) {

        // If schedule conditions are not met
        if(!this.check_conditions(stopAttributes)) {
            return;
        }

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

    // details is optional (stores a simplified history)
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

    // alias for fail_workflow_execution
    fail: function (reason, details, cb) {
        this.fail_workflow_execution(reason, details, cb);
    },



    schedule: function (scheduleAttributes, swfAttributes) {

        // If schedule conditions are not met
        if(!this.check_conditions(scheduleAttributes)) {
            return;
        }

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
        if (typeof ta.input !== "string") {
            ta.input = JSON.stringify(ta.input);
        }

        // Task list (if not set, use the default taskList)
        if (!ta.taskList) {
            ta.taskList = this.config.events[0].workflowExecutionStartedEventAttributes.taskList;
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


    start_childworkflow: function(startAttributes, swfAttributes) {

        // If schedule conditions are not met
        if(!this.check_conditions(startAttributes)) {
            return;
        }

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



    start_timer: function(startAttributes, swfAttributes) {

        // If schedule conditions are not met
        if(!this.check_conditions(startAttributes)) {
            return;
        }

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


    /*********************************************
     * Methods to query the state of the workflow
     ********************************************/

    _has_evenType_for_activityId: function (activityId, eventType) {
        var attributesKey = eventType.substr(0, 1).toLowerCase() + eventType.substr(1) + "EventAttributes";
        return this.config.events.some(function (evt) {
            if (evt.eventType === eventType) {
                if (evt[attributesKey].activityId === activityId) {
                    return true;
                }
            }
        });
    },

    has_schedule_activity_task_failed: function () {
        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];
            var evtType = evt.eventType;
            if (evtType === "ScheduleActivityTaskFailed") {
                return evt;
            }
        }
        return false;
    },

    // Return true if the timer already started
    timer_scheduled: function(control) {
        return this.config.events.some(function (evt) {
            if (evt.eventType === "TimerStarted") {
                if (evt.timerStartedEventAttributes.control === control) {
                    return true;
                }
            }
        });
    },

    // return true if the timer has fired
    timer_fired: function(control) {
        return this.config.events.some(function (evt) {
            if (evt.eventType === "TimerFired") {
                var initiatedEventId = evt.timerFiredEventAttributes.startedEventId;
                var initiatedEvent = this.eventById(initiatedEventId);

                if (initiatedEvent.timerStartedEventAttributes.control === control) {
                    return true;
                }
            }
        }, this);
    },

    // lookup for StartChildWorkflowExecutionInitiated
    childworkflow_scheduled: function(control) {
        return this.config.events.some(function (evt) {
            if (evt.eventType === "StartChildWorkflowExecutionInitiated") {
                if (evt.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
                    return true;
                }
            }
        });
    },

    childworkflow_completed: function(control) {
        return this.config.events.some(function (evt) {
            if (evt.eventType === "ChildWorkflowExecutionCompleted") {
                var initiatedEventId = evt.childWorkflowExecutionCompletedEventAttributes.initiatedEventId;
                var initiatedEvent = this.eventById(initiatedEventId);

                if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
                    return true;
                }
            }
        }, this);
    },



    // returns true if the activityId started
    is_activity_started: function (activityId) {
        return this._has_evenType_for_activityId(activityId, "ActivityTaskStarted");
    },

    // returns true if the activityId has timed out
    has_activity_timedout: function (activityId) {
        return this._has_evenType_for_activityId(activityId, "ActivityTaskTimedOut");
    },

    // returns true if the activityId has failed
    has_activity_failed: function (activityId) {
        return this._has_evenType_for_activityId(activityId, "ActivityTaskFailed");
    },

    failed: function () {
        var i;
        for (i = 0; i < arguments.length; i++) {
            if (!this.failed(arguments[i])) {
                return false;
            }
        }
        return true;
    },

    // returns true if the activityId is canceled
    is_activity_canceled: function (activityId) {
        return this._has_evenType_for_activityId(activityId, "ActivityTaskCanceled");
    },

    // returns true if the activityId is scheduled
    is_activity_scheduled: function (activityId) {
        return this._has_evenType_for_activityId(activityId, "ActivityTaskScheduled");
    },

    scheduled: function () {
        var i;
        for (i = 0; i < arguments.length; i++) {
            if (!this.is_activity_scheduled(arguments[i])) {
                return false;
            }
        }
        return true;
    },

    // returns true if no Activity has been scheduled yet...
    has_workflow_just_started: function () {
        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];
            var evtType = evt.eventType;
            if (evtType === "ActivityTaskScheduled") {
                return false;
            }
        }
        return true;
    },

    // alias for has_workflow_just_started
    just_started: function () {
        return this.has_workflow_just_started();
    },

    // returns true if we have a Completed event for the given activityId
    has_activity_completed: function (activityId) {
        return this.config.events.some(function (evt) {
            if (evt.eventType === "ActivityTaskCompleted") {
                if (this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) === activityId) {
                    return true;
                }
            }
        }, this);
    },

    completed: function () {
        var i;
        for (i = 0; i < arguments.length; i++) {
            if ( ! (this.has_activity_completed(arguments[i]) || this.childworkflow_completed(arguments[i])  || this.timer_fired(arguments[i]) ) ) {
                return false;
            }
        }
        return true;
    },

    // Return the activityId
    activityIdFor: function (scheduledEventId) {
        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];
            if (evt.eventId === scheduledEventId) {
                return evt.activityTaskScheduledEventAttributes.activityId;
            }
        }
        return false;
    },

    // Return the activityId
    eventById: function (eventId) {
        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];
            if (evt.eventId === eventId) {
                return evt;
            }
        }
        return false;
    },

    /**
     * Getting results :
     */

    workflow_input: function () {

        var wfInput = this.config.events[0].workflowExecutionStartedEventAttributes.input;
        
        try {
            var d = JSON.parse(wfInput);
            return d;
        } catch (ex) {
            return wfInput;
        }
    },

    results: function (activityId, options) {
        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];

            if (evt.eventType === "ActivityTaskCompleted") {
                if (this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) === activityId) {

                    var result = evt.activityTaskCompletedEventAttributes.result;

                    if (!!options && !!options.format && options.format === "json") {
                        result = JSON.parse(result);
                    }

                    //return result;
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


    childworkflow_results: function(control) {

        var i;
        for (i = 0; i < this.config.events.length; i++) {
            var evt = this.config.events[i];

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
    },


    /**
     * Check if a set of conditions is met
     * Currently only handles conditions.after
     */
    check_conditions: function(deciderParams) {

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
            if(condition === 1 /*COMPLETED*/ && !this.completed(cdtName) ) {
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
    }

};


