
var assert = require("assert");

var swf = require('../index');
var EventList = swf.EventList;


describe('EventList', function(){
  describe('#indexOf()', function(){

    var evl = new EventList([
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
            "decisionTaskStartedEventAttributes": {
              "identity": "Decider01",
                "scheduledEventId": 2
              },
              "eventId": 3,
              "eventTimestamp": 1326593394.566,
              "eventType": "DecisionTaskStarted"
            }
          ]);

    it('is_activity_started', function(){
      assert.equal (false, evl.is_activity_started('test1') );
    })

    it('workflow just started', function() {
          assert.equal (true, evl.has_workflow_just_started() );
    })

    it('has input', function() {
        assert.equal ("arbitrary-string-that-is-meaningful-to-the-workflow", evl.workflow_input() );
    })


  })
})
