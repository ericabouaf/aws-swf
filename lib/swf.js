var https = require("https"),
    crypto = require("crypto");

// a generic AWS API Client which handles the general parts
exports.createClient = function(obj) {
   
   if(!obj.host) {
      obj.host = "swf.us-east-1.amazonaws.com";
   }
   
  obj.call = function (action, query, callback) {
     
    if (obj.secretAccessKey === null || obj.accessKeyId === null) {
      throw("secretAccessKey and accessKeyId must be set");
    }
    
    var body = JSON.stringify(query);
    
    // Sign the request
    var headers = {
         "Content-Length": body.length,
         "Content-Type": "application/x-amz-json-1.0",
         "Date": (new Date()).toUTCString(),
         "Host": obj.host,
         "X-Amz-Target": "SimpleWorkflowService."+action
        },
        canonic = "",
        SignedHeaders = [];
    for(var k in headers) {
      canonic += k.toLowerCase()+":"+headers[k]+"\n";
      SignedHeaders.push(k);
    }
    
    var StringToSign = ["POST","/","",canonic,body].join("\n"),
        bytestosign = crypto.createHash('sha256').update(StringToSign).digest(),
        hash = crypto.createHmac("sha256", obj.secretAccessKey),
        Signature = hash.update(bytestosign).digest("base64");
        
    // Add the X-Amzn-Authorization header
    headers["X-Amzn-Authorization"] =
      "AWS3 " +
      "AWSAccessKeyId=" + obj.accessKeyId + "," +
      "Algorithm=HmacSHA256," +
      "SignedHeaders="+SignedHeaders.join(';')+','+
      "Signature=" + Signature;
      
    var options = {
      host: obj.host,
      path: "/",
      method: 'POST',
      headers: headers
    };
    
    // TODO: request.setTimeout(timeout, [callback]) timeout 70 s for poll methods
    
    var req = https.request(options, function (res) {
       var data = '';
       res.addListener('data', function (chunk) {
          data += chunk.toString();
       });
       // TODO: add error handler
       res.addListener('end', function() {
          
          var ret = {};
          if(data !== "") {
             ret = JSON.parse(data);
          }
          
          if(res.statusCode >= 300) {
             callback(ret, null);
          }
          else {
             callback(null, ret);
          }
       });
    });
    
    req.write(body);
    req.end();
    
    // return the request object so that you can call request.abort() on long-polling methods to terminate them properly
    return req;
  };
  
  // Hash of actions:requiredParameters
  var SWFactions = {
     CountClosedWorkflowExecutions: ["domain"],
     CountOpenWorkflowExecutions: ["domain", "startTimeFilter"],
     CountPendingActivityTasks: ["domain", "taskList"],
     CountPendingDecisionTasks: ["domain", "taskList"],
     DeprecateActivityType: ["domain", "activityType"],
     DeprecateDomain: ["name"],
     DeprecateWorkflowType: ["domain", "workflowType"],
     DescribeActivityType: ["domain", "activityType"],
     DescribeDomain: ["name"],
     DescribeWorkflowExecution: ["domain", "execution"],
     DescribeWorkflowType: ["domain", "workflowType"],
     GetWorkflowExecutionHistory: ["domain", "execution"],
     ListActivityTypes: ["domain", "registrationStatus"],
     ListClosedWorkflowExecutions: ["domain"],
     ListDomains: ["registrationStatus"],
     ListOpenWorkflowExecutions: ["domain", "startTimeFilter"],
     ListWorkflowTypes: ["domain", "registrationStatus"],
     PollForActivityTask: ["domain"],
     PollForDecisionTask: ["domain", "taskList"],
     RecordActivityTaskHeartbeat: ["taskToken"],
     RegisterActivityType: ["domain", "name", "version"],
     RegisterDomain: ["name", "workflowExecutionRetentionPeriodInDays"],
     RegisterWorkflowType: ["domain", "name", "version"],
     RequestCancelWorkflowExecution: ["domain", "workflowId"],
     RespondActivityTaskCanceled: ["taskToken"],
     RespondActivityTaskCompleted: ["taskToken"],
     RespondActivityTaskFailed: ["taskToken"],
     RespondDecisionTaskCompleted: ["taskToken"],
     SignalWorkflowExecution: ["domain", "signalName", "workflowId"],
     StartWorkflowExecution: ["domain", "workflowId", "workflowType"],
     TerminateWorkflowExecution: ["domain", "workflowId"]
  };
  
  var addMethod = function(action, requiredParameters) {
       obj[action] = function(config, cb) {
          requiredParameters.forEach(function(p) {
             if(!config[p]) {
                throw(action+': '+p+' must be set');
             }
          });
          this.call(action, config, cb);
       };
    };
  
  for(var action in SWFactions) {
     addMethod(action, SWFactions[action]);
  }
  
  return obj;
};
