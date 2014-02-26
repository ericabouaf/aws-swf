
var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

var swf = require('../index');
var EventList = swf.EventList;


describe('EventList', function(){
    describe('no_activity', function() {

        var fixtureFile = 'eventlist_noactivity.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

        it('is_activity_started', function(){
          assert.equal (false, evl.is_activity_started('test1') );
        })

        it('workflow just started', function() {
              assert.equal (true, evl.just_started() );
        })

        it('has input', function() {
            assert.equal ("arbitrary-string-that-is-meaningful-to-the-workflow", evl.workflow_input() );
        })


        // has_schedule_activity_task_failed
        it('#has_schedule_activity_task_failed', function() {
            evl.has_schedule_activity_task_failed();
        })


        // timer_canceled
        it('#timer_canceled', function() {
            evl.timer_canceled('timerId');
        })

        // timer_fired
        it('#timer_fired', function() {
            evl.timer_fired('timerId');
        })

        // timer_scheduled
        it('#timer_scheduled', function() {
            evl.timer_scheduled('timerId');
        })

        // has_activity_timedout
        it('#has_activity_timedout', function() {
            evl.has_activity_timedout('my-activity');
        })

        // has_activity_failed
        it('#has_activity_failed', function() {
            evl.has_activity_failed('my-activity');
        })

        // failed
        it('#failed', function() {
            evl.failed('my-activity');
        })

        // timed_out
        it('#timed_out', function() {
            evl.timed_out('my-activity');
        })

        // signal_arrived
        it('#signal_arrived', function() {
            evl.signal_arrived('my-signal');
        })

        // signal_input
        it('#signal_input', function() {
            evl.signal_input('my-signal');
        })

        // is_activity_canceled
        it('#is_activity_canceled', function() {
            evl.is_activity_canceled('my-activity');
        })

        // is_activity_scheduled
        it('#is_activity_scheduled', function() {
            evl.is_activity_scheduled('my-activity');
        })

        // scheduled
        it('#scheduled', function() {
            evl.scheduled('my-activity');
        })

        // has_activity_completed
        it('#has_activity_completed', function() {
            evl.has_activity_completed('my-activity');
        })

        // completed
        it('#completed', function() {
            evl.completed('my-activity');
        })

        // activityIdFor
        // eventById
        // results
        // get_last_marker_details

    })

    describe('childworkflow', function() {

        var fixtureFile = 'eventlist_childworkflow.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);


        // childworkflow_scheduled
        it('#childworkflow_scheduled()', function() {
            assert.equal(true, evl.childworkflow_scheduled('my-childworkflow') );
        })

        // childworkflow_completed
        it('#childworkflow_completed()', function() {
            assert.equal(true, evl.childworkflow_completed('my-childworkflow'));
        })

        // childworkflow_failed
        it('#childworkflow_failed()', function() {
            evl.childworkflow_failed('my-childworkflow');
        })

        // childworkflow_results
        it('#childworkflow_results()', function() {
            assert.equal("my-childworkflow-result", evl.childworkflow_results('my-childworkflow') );
        })

        it('#childworkflow_results not available()', function() {
            assert.equal(null, evl.childworkflow_results('does-not-exist') );
        })

        it('#completed', function() {
            assert.equal(true, evl.completed('my-childworkflow') );
        })

    });


    describe('oneactivity', function() {

        var fixtureFile = 'eventlist_oneactivity.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

        // scheduled
        it('#scheduled', function() {
            assert.equal(true, evl.scheduled('my-activity') );
        })

        // completed
        it('#completed', function() {
            assert.equal(true, evl.completed('my-activity') );
        })

        it('#results()', function() {
            assert.equal("my-activity-results", evl.results('my-activity') );
        })

        it('#has_workflow_just_started()', function() {
            assert.equal(false, evl.just_started() );
        });

    })

})
