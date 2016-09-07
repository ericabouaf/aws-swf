
var assert = require('assert');

var swf = require('../index');
var Decider = swf.Decider;


var pollForDecisionTaskCallCount = 0;
var swfClientMock = {
  pollForDecisionTask: function(p, cb) {
    pollForDecisionTaskCallCount += 1;

    setTimeout(function() {
      cb(null, {
        taskToken: (pollForDecisionTaskCallCount == 1) ? '12345' : '',
        events: (pollForDecisionTaskCallCount == 1) ? [
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
       ] : [],
        nextPageToken: (pollForDecisionTaskCallCount == 1) ? 'THENEXTPAGET' : undefined
      });
    }, 10);
  }
};
var nullLogger = { info: function() {} };

function newDecider() {
  return new Decider({
    domain: 'test-domain',
    taskList: {
      name: 'test-taskList'
    },
    logger: nullLogger
  }, swfClientMock);
}

describe('Decider', function(){

    it('should check domain and taskList', function() {

      var error_raised = false;
      try {
        var decider = new Decider({
        }, swfClientMock);
      }
      catch(ex) {
        error_raised = true;
      }

      assert.equal(true, error_raised);

    });

    it('should start, emit DecisionTask, and stop', function(done) {

      var decider = newDecider();

      decider.on('decisionTask', function(decisionTask) {
        decider.stop();
        done();
      });

      decider.start();
    });

    describe('.stopHandler()', function() {
      it('should be bound to the decider object and call stop()', function() {
        var decider = newDecider();
        var context = {};
        var boundHandler = decider.stopHandler;
        decider.stop = function() { context.decider = this; }
        boundHandler();
        assert.equal(context.decider, decider);
      });

      it('should not call stop() more than once', function() {
        var decider = newDecider();
        var count = { stop: 0, log: 0 };
        decider.logger = { info: function() { count.log += 1; } };
        decider.stop = function() {
          count.stop += 1;
          decider.constructor.prototype.stop.apply(decider);
        };
        decider.stopHandler();
        assert.deepEqual(count, { stop: 1, log: 1 });
        decider.stopHandler();
        decider.stopHandler();
        assert.deepEqual(count, { stop: 1, log: 1 });
      });
    });
});
