
var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

var swf = require('../index');
var EventList = swf.EventList;


describe('EventList', function(){
  describe('#indexOf()', function(){

    var fixtureFile = 'eventlist_noactivity.json';
    var fixtureData = JSON.parse(fs.readFileSync( path.join(__dirname , '..', 'fixtures', fixtureFile), 'utf8') );
    var evl = new EventList(fixtureData);

    it('is_activity_started', function(){
      assert.equal (false, evl.is_activity_started('test1') );
    })

    it('workflow just started', function() {
          assert.equal (true, evl.has_workflow_just_started() );
    })

    it('has input', function() {
        assert.equal ("arbitrary-string-that-is-meaningful-to-the-workflow", evl.workflow_input() );
    })


  })
})
