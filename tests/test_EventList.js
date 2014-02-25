var vows = require('vows'),
    assert = require('assert');

var swf = require('../index');
var EventList = swf.EventList;

vows.describe('aws-swf EventList test suite').addBatch({

   'EventList query methods test': {

      topic: function() {
         return new EventList([
         	{
         		"decisionTaskStartedEventAttributes": {
         			"identity": "Decider01",
          			"scheduledEventId": 2
          		},
          		"eventId": 3,
          		"eventTimestamp": 1326593394.566,
          		"eventType": "DecisionTaskStarted"
          	},
          	{
          		"decisionTaskScheduledEventAttributes": {
          			"startToCloseTimeout": "600",
          			"taskList": {"name": "specialTaskList"}
          		},
          		"eventId": 2,
          		"eventTimestamp": 1326592619.474,
          		"eventType": "DecisionTaskScheduled"
          	},
          	{
          		"eventId": 1,
          		"eventTimestamp": 1326592619.474,
          		"eventType": "WorkflowExecutionStarted",
          		"workflowExecutionStartedEventAttributes": {
          			"childPolicy": "TERMINATE",
          			"executionStartToCloseTimeout": "3600",
          			"input": "arbitrary-string-that-is-meaningful-to-the-workflow",
          			"parentInitiatedEventId": 0,
          			"tagList": ["music purchase", "digital", "ricoh-the-dog"],
          			"taskList": {"name": "specialTaskList"},
          			"taskStartToCloseTimeout": "600",
          			"workflowType": {
          				"name": "customerOrderWorkflow",
          				"version": "1.0"
          			}
          		}
          	}
          ]);
      },

      'we get an event list': {
      	'is_activity_started': function (evl) {
         	assert.equal (false, evl.is_activity_started('test1') );
     	},
     	'workflow just started': function(evl) {
			assert.equal (true, evl.has_workflow_just_started() );
     	}
      }
   }

}).export(module); // Export the Suite