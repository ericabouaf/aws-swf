
var assert = require('assert');

var swf = require('../index');
var ActivityTask = swf.ActivityTask;

var mockSwfClient = {

    respondActivityTaskCompleted: function(p, cb) {
        cb();
    },
    
    respondActivityTaskFailed: function(p, cb) {
        cb();
    },
    
    recordActivityTaskHeartbeat: function(p, cb) {
        cb();
    }
    
};

describe('ActivityTask', function(){

  describe('new()', function() {
    it('should intantiate without swfClient', function() {
      var t = new ActivityTask({});
    })
  });

  describe('#respondCompleted()', function() {

    var t = new ActivityTask({}, mockSwfClient);

    it('with string data', function(done) {
      t.respondCompleted("some result data...", done);
    })

    it('with object result', function(done) {
      t.respondCompleted({ foo: "bar"}, done);
    })

    it('with null result', function(done) {
      t.respondCompleted(null, done);
    })

  });


  describe('#respondFailed()', function() {

    var t = new ActivityTask({}, mockSwfClient);

    it('with string data', function(done) {
      t.respondFailed("some reason", "details here", done);
    })

    it('with json details', function(done) {
      t.respondFailed("some reason", {foo: "details here"}, done);
    })

  });

  describe('#recordHeartbeat()', function() {

    var t = new ActivityTask({}, mockSwfClient);

    it('with string details', function(done) {
      t.recordHeartbeat("some reason", done);
    })

    it('with json details', function(done) {
      t.recordHeartbeat({foo: "details here"}, done);
    })

    it('with no details', function(done) {
      t.recordHeartbeat(null, done);
    })

  });


});
