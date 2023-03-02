
var assert = require('assert');

var swf = require('../index');
var ActivityPoller = swf.ActivityPoller;


var pollForActivityTaskCallCount = 0;
var swfClientMock = {
    pollForActivityTask: function(p, cb) {
        pollForActivityTaskCallCount += 1;
        
        setTimeout(function() {
            cb(null, {
                taskToken: (pollForActivityTaskCallCount == 2) ? '12345' : undefined
            });
        }, 10);
    }
};
var nullLogger = { info: function() {} };

describe('ActivityPoller', function(){

    it('should check domain and taskList', function() {

      var error_raised = false;
      try {
        var activityPoller = new ActivityPoller({
        }, swfClientMock);
      }
      catch(ex) {
        error_raised = true;
      }

      assert.equal(true, error_raised);

    });

    it('should start, emit ActivityTask, and stop', function(done) {

      var activityPoller = new ActivityPoller({
        domain: 'test-domain',
        taskList: {
          name: 'test-taskList'
        },
        logger: nullLogger
      }, swfClientMock);


      activityPoller.on('activityTask', function(activityTask) {
        activityPoller.stop();
        done();
      });

      activityPoller.start();
    });

    it('should insntaiate without swfClient', function() {
      var activityPoller = new ActivityPoller({
        domain: 'test-domain',
        taskList: {
          name: 'test-taskList'
        }
      });
    });

});
