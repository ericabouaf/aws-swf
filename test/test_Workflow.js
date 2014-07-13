
var assert = require('assert');

var swf = require('../index');
var Workflow = swf.Workflow;

var mockSwfClient = {
  startWorkflowExecution: function(p, cb) {
    process.nextTick(function () {
        cb(null, {
            runId: '12345678'
        });
      });
    },

  registerWorkflowType: function(p, cb) {
    cb();
  }

};

describe('Workflow', function(){

  describe('new()', function() {
    it('should intantiate without swfClient', function() {
      var w = new Workflow({});
    })
  });

  describe('#start()', function() {
    var w = new Workflow({}, mockSwfClient);
    it('should start', function(done) {
      w.start({
        input: "Some input Data"
      }, done);
    })
  });

  describe('#startCb()', function() {
    it('adds runId to returned workflow', function(done) {
      var erroringSwfClient = Object.create(mockSwfClient);
      var w = new Workflow({}, erroringSwfClient);
      w.startCb({
        input: "Some input Data"
      }, function (err, workflowExecution) {
        if (err) {
          done(err);
          return;
        }
        
        assert.equal(workflowExecution.runId, '12345678');
        done();
      });
    })

    it('should handle immediate errors gracefully', function(done) {
      var erroringSwfClient = Object.create(mockSwfClient);
      erroringSwfClient = Object.create(mockSwfClient);
      erroringSwfClient.startWorkflowExecution = function (p, cb) {
          // Intentionally do not wait for the next tick to report the error
          cb(new Error('Unexpected failure'));
      };

      var w = new Workflow({}, erroringSwfClient);
      w.startCb({
        input: "Some input Data"
      }, function (err, workflowExecution) {
        if (err) {
          assert.equal(err.message, "Unexpected failure");
          done();
          return;
        } else {
          throw new Error('A failure was expected');
        }
      });
    })
  });

  describe('#register()', function() {
    var w = new Workflow({
      domain: 'test-domain',
      workflowType: {
        name: 'test-workflow',
        version: '1.0'
      }
    }, mockSwfClient);
    it('should register', function(done) {
      w.register(done);
    })
  });


});
