
var assert = require('assert');

var swf = require('../index');
var WorkflowExecution = swf.WorkflowExecution;

var mockSwfClient = {

  startWorkflowExecution: function(p, cb) {
    cb(null, {
      runId: '12345678'
    });
  },
    
  signalWorkflowExecution: function(p, cb) {
    cb();
  },
    
  getWorkflowExecutionHistory: function(p, cb) {
    cb();
  },
    
  terminateWorkflowExecution: function(p, cb) {
    cb();
  }
};

describe('WorkflowExecution', function(){


  describe('#start()', function() {

    var we = new WorkflowExecution(mockSwfClient, {
      workflowId: 'a custom unique id'
    });

    it('should start', function(done) {

      we.start({
        input: "Some input Data"
      }, done);

    })
  });

  describe('#signal()', function() {

    var we = new WorkflowExecution(mockSwfClient, {
      workflowId: 'a custom unique id'
    });

    it('should signalWorkflowExecution', function(done) {

      we.signal({
        "signalName": "mySignal"
      }, done);

    })
  });

  describe('#getHistory()', function() {

    var we = new WorkflowExecution(mockSwfClient, {
      workflowId: 'a custom unique id'
    });

    it('should getHistory', function(done) {

      we.getHistory({
        "execution": {
          "runId": "string",
          "workflowId": "string"
        }
      }, done);

    })
  });

  describe('#terminate()', function() {

    var we = new WorkflowExecution(mockSwfClient, {
      workflowId: 'a custom unique id'
    });

    it('should getHistory', function(done) {

      we.terminate({
          "reason": "string"
      }, done);

    })
  });
  



});
