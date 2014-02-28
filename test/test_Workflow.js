
var assert = require('assert');

var swf = require('../index');
var Workflow = swf.Workflow;

var mockSwfClient = {

  client: {

    startWorkflowExecution: function(p, cb) {
      cb(null, {
        runId: '12345678'
      });
    },

    registerWorkflowType: function(p, cb) {
      cb();
    }

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
