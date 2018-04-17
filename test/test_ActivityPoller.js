
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
        }, 2000);
    }
};
var nullLogger = { info: function() {} };
var domain = 'dev-mediastream-vms'
var taskList = 'dev-us-LiveEditor-v1.0'

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
        domain: domain,
        taskList: {
          name: taskList
        },
        logger: nullLogger
      }, swfClientMock);
      console.log('here')
      activityPoller.start();
      console.log('her2e')

      activityPoller.on('activityTask', function(activityTask) {
        activityPoller.stop();
        done();
      });


    });

    it('should insntaiate without swfClient', function() {
      var activityPoller = new ActivityPoller({
        domain: domain,
        taskList: {
          name: taskList
        }
      });
    });

});
