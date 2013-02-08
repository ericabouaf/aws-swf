
// Start a ActivityPoller which spawns the given activity worker file

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path'),
    fs = require('fs');

// Create SWF client
var swf = require('../index');
var swfClient = swf.createClient({
    accessKeyId: argv.accessKeyId,
    secretAccessKey: argv.secretAccessKey
});

// Start the activity poller
var activityPoller = new swf.ActivityPoller(swfClient, {
    domain: 'my-domain',
    taskList: { name: 'task-list' },
    identity: 'simple poller ' + process.pid
}, function (task, cb) {

    task.respondCompleted({captcha_text: 'data'}, function (err) {});

});

activityPoller.start();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
    console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
    activityPoller.stop();
});

