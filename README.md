# Amazon SWF (Simple Workflow) Framework for Node.js

This library contains a simple client to use the Amazon SWF API methods.

It also provides classes to wrap the common concepts of the API.

 * ActivityPoller
 * ActivityTask
 * Decider
 * DecisionTask
 * Workflow
 * WorkflowExecution

## Disclaimer

aws-swf is still under development, and is not suitable for production yet.

## Install

    npm install aws-swf

## Usage

### Connecting to AWS SWF

    
    var swf = require("aws-swf");
    var swfClient = swf.createClient({
        accessKeyId: "... access key id here ...",
        secretAccessKey: "... secret key here ..."
    });
    

### Generic SWF call (RAW call to the API)

    swfClient.DescribeDomain({"name": "test-my-swf"}, function(err, result) {
        
        if(err) console.log("error", err);
        
        console.log("result", JSON.stringify(result));
    });


### Raw Methods

The detailed API documentation http://docs.amazonwebservices.com/amazonswf/latest/apireference/Welcome.html

 * CountClosedWorkflowExecutions
 * CountOpenWorkflowExecutions
 * CountPendingActivityTasks
 * CountPendingDecisionTasks
 * DeprecateActivityType
 * DeprecateDomain
 * DeprecateWorkflowType
 * DescribeActivityType
 * DescribeDomain
 * DescribeWorkflowExecution
 * DescribeWorkflowType
 * GetWorkflowExecutionHistory
 * ListActivityTypes
 * ListClosedWorkflowExecutions
 * ListDomains
 * ListOpenWorkflowExecutions
 * ListWorkflowTypes
 * PollForActivityTask
 * PollForDecisionTask
 * RecordActivityTaskHeartbeat
 * RegisterActivityType
 * RegisterDomain
 * RegisterWorkflowType
 * RequestCancelWorkflowExecution
 * RespondActivityTaskCanceled
 * RespondActivityTaskCompleted
 * RespondActivityTaskFailed
 * RespondDecisionTaskCompleted
 * SignalWorkflowExecution
 * StartWorkflowExecution
 * TerminateWorkflowExecution


### Register(Domain|ActivityType|WorkflowType)

    swfClient.RegisterDomain({...}, function(err, result) { ... });
    swfClient.RegisterActivityType({...}, function(err, result) { ... });
    swfClient.RegisterWorkflowType({...}, function(err, result) { ... });

### Creating an Activity Poller

    TODO
    

### Creating a Decider


### Starting a Workflow



## Running the examples

 * Copy examples/config.example.js to examples/config.js and edit  your AWS credentials
 * run the examples :)



