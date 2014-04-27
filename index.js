exports.AWS = require('aws-sdk');
exports.createClient = require("./lib/swf").createClient;

exports.Workflow = require("./lib/workflow").Workflow;
exports.WorkflowExecution = require("./lib/workflow-execution").WorkflowExecution;
exports.ActivityPoller = require("./lib/activity-poller").ActivityPoller;
exports.ActivityTask = require("./lib/activity-task").ActivityTask;
exports.Decider =  require("./lib/decider").Decider;
exports.DecisionTask =  require("./lib/decision-task").DecisionTask;
exports.EventList = require("./lib/event-list").EventList;
exports.DecisionResponse = require("./lib/decision-response").DecisionResponse;
exports.Poller = require("./lib/poller").Poller;
