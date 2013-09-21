
var createClient = require('./swf').createClient,
    DecisionResponse = require('./decision-response').DecisionResponse,
    EventList = require('./event-list').EventList;

/**
 * A Decision Task is composed by an eventList and a DecisionResponse
 * @constructor
 */
var DecisionTask = exports.DecisionTask = function (config, swfClient) {

    this.config = config;
    
   /**
    * The history event list
    * @type EventList
    */
    this.eventList = new EventList(config.events);


    var defaultTaskList = config.events[0].workflowExecutionStartedEventAttributes.taskList;

   /**
    * The decision response instance
    * @type DecisionResponse
    */
    this.response = new DecisionResponse(swfClient, config.taskToken, defaultTaskList);
};

/*DecisionTask.prototype = {

};*/

