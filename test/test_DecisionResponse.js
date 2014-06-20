
var assert = require('assert');

var swf = require('../index');
var DecisionResponse = swf.DecisionResponse;


var swfClientMock = {
  respondDecisionTaskCompleted: function(p, cb) {
    cb();
  }
};

describe('DecisionResponse', function(){

    it('should instantiate with no decisions', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      assert.equal(null, dr.decisions);
    });

    it('#wait()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.wait();
      assert.deepEqual([], dr.decisions);
    });

    it('#send()', function(done) {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.stop({
        result: "some results"
      });
      dr.send(done);
    });


    it('#start_childworkflow()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.start_childworkflow({
        name: 'my-task-control',
        workflow: 'my-child-workflow'
      });
    });

    it('#schedule()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.schedule({
        /*name: 'my-task-control',
        workflow: 'my-child-workflow'*/
      });
    });

    it('#fail()', function(done) {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.fail("", "", done);
    });

    it('#start_timer()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.start_timer({}, {});
    });

    it('#add_marker()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.add_marker('my-marker', "details ...");
    });

    it('#cancel_timer()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.cancel_timer('myTimerId');
    });

    it('#request_cancel_activity_task()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.request_cancel_activity_task('myActivityId');
    });

    it('#signal_external_workflow()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.signal_external_workflow();
    });

    it('#request_cancel_external_workflow()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.request_cancel_external_workflow('workflowId', 'runId', 'control-step');
    });

    it('#cancel_workflow()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.cancel_workflow('details...');
    });

    it('#continue_as_new_workflow()', function() {
      var dr = new DecisionResponse(swfClientMock, '12345', 'my-tasklist');
      dr.continue_as_new_workflow();
    });


});
