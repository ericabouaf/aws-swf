
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

        /*it('#has_schedule_activity_task_failed', function() {
            evl.has_schedule_activity_task_failed();
        })*/

        it('#timer_canceled', function() {
            evl.timer_canceled('timerId');
        })

        it('#timer_fired', function() {
            evl.timer_fired('timerId');
        })

        it('#timer_scheduled', function() {
            evl.timer_scheduled('timerId');
        })

        it('#has_activity_timedout', function() {
            evl.has_activity_timedout('my-activity');
        })

        it('#has_activity_failed', function() {
            evl.has_activity_failed('my-activity');
        })

        it('#failed', function() {
            evl.failed('my-activity');
        })

        it('#timed_out', function() {
            evl.timed_out('my-activity');
        })

        it('#signal_arrived', function() {
            evl.signal_arrived('my-signal');
        })

        it('#signal_input', function() {
            evl.signal_input('my-signal');
        })

        it('#is_activity_canceled', function() {
            evl.is_activity_canceled('my-activity');
        })

        it('#is_activity_scheduled', function() {
            evl.is_activity_scheduled('my-activity');
        })

        it('#scheduled', function() {
            evl.scheduled('my-activity');
        })

        it('#has_activity_completed', function() {
            evl.has_activity_completed('my-activity');
        })

        it('#completed', function() {
            evl.completed('my-activity');
        })


        it('#activityIdFor', function() {
            assert.equal(false, evl.activityIdFor(0) );
        });

        it('#eventById', function() {
            assert.equal(false, evl.eventById(0) );
        });

        it('#results', function() {
            assert.equal(null, evl.results('does-not-exist'));
        });

    })

    describe('childworkflow', function() {

        var fixtureFile = 'eventlist_childworkflow.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

    
        it('has json input', function() {
            assert.deepEqual ({ foo: "arbitrary-string-that-is-meaningful-to-the-workflow"}, evl.workflow_input() );
        })

        // childworkflow_scheduled
        it('#childworkflow_scheduled()', function() {
            assert.equal(true, evl.childworkflow_scheduled('my-childworkflow') );
        })

        // childworkflow_completed
        it('#childworkflow_completed()', function() {
            assert.equal(true, evl.childworkflow_completed('my-childworkflow'));
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

        it('#childworkflow_failed()', function() {
            assert.equal(true, evl.childworkflow_failed("my-second-childworkflow") );
            assert.equal(true, evl.childworkflow_failed("my-third-childworkflow" ) );
        })

    });


    describe('activities', function() {

        var fixtureFile = 'eventlist_activities.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

        it('#scheduled', function() {
            assert.equal(true, evl.scheduled('my-activity') );
        })

        it('#completed', function() {
            assert.equal(true, evl.completed('my-activity') );
        })

        it('#results()', function() {
            assert.equal("my-activity-results", evl.results('my-activity') );
            assert.deepEqual({foo: "my-activity-results"}, evl.results('my-json-activity') );
        })

        it('#has_workflow_just_started()', function() {
            assert.equal(false, evl.just_started() );
        })

        /*it('#has_schedule_activity_task_failed()', function() {
            assert.notEqual(false, evl.has_schedule_activity_task_failed() ); // TODO: argument !
        })*/

        it('#has_activity_timedout()', function() {
            assert.equal(true, evl.has_activity_timedout("my-third-activity") );
            assert.equal(true, evl.timed_out("my-third-activity") );
        })

        it('#failed()', function() {
            assert.equal(true, evl.failed("my-fourth-activity") );
        })
        

    })


    describe('markers', function() {

        var fixtureFile = 'eventlist_marker.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

        it('#get_last_marker_details', function() {
            assert.equal("my-marker-details", evl.get_last_marker_details('my-marker') );
        })

    })


    describe('signals', function() {

        var fixtureFile = 'eventlist_signal.json';
        var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
        var evl = new EventList(fixtureData);

        it('#signal_arrived()', function() {
            assert.equal(true, evl.signal_arrived('my-signal') );
        })

        it('#signal_input()', function() {
            assert.equal("my-signal-input", evl.signal_input('my-signal') );  
            assert.deepEqual({foo: "my-signal-input"}, evl.signal_input('json-signal') );  
        })

    })


})
