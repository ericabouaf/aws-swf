
var DecisionResponse = require('./decision-response').DecisionResponse,
    EventList = require('./event-list').EventList;

/**
 * A Decision Task is composed by an eventList and a DecisionResponse
 * @constructor
 * @param {Object} config
 * @param {Object} [swfClient]
 * @param {Object} [events]
 */
var DecisionTask = function (config, swfClient, events) {

    this.config = config;

    /**
     * The history event list
     * @type EventList
     */
    this.eventList = new EventList(events || config.events);


    var defaultTaskList = config.events[0].workflowExecutionStartedEventAttributes.taskList;

    /**
     * The decision response instance
     * @type DecisionResponse
     */
    this.response = new DecisionResponse(swfClient, config.taskToken, defaultTaskList);
};

exports.DecisionTask = DecisionTask;