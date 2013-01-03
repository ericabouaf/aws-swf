/*global console,require,__dirname*/

var vm = require('vm'),
    fs=require('fs'),
    graphviz = require('graphviz');

var deciderCode = fs.readFileSync(process.argv[2]);

var g = graphviz.digraph("G");
var nodes = {};

var sandbox = {

   just_started: function() {
      return true;
   },

   schedule: function () {
       // TODO
   },
   scheduled: function () {
       return false;
   },
   waiting_for: function () {
   },
   completed: function () {
       return false;
   },
   
   stop: function (deciderParams, val) {

   },
   COMPLETED: 1,
   FAILED: 2,
   TIMEDOUT: 4,

   results: function () {
       return {};
   },
   workflow_input: function () {
       return {};
   },
   log: function () {
       console.log.apply(console, ["DECIDER LOG : "].concat(arguments));
   }
};

// TODO: get from SWF...
var activityNames = ["mturk_createHit", "sleep", "sum", "echo", "ec2_runInstances", "ec2_terminateInstances"];
activityNames.forEach(function(activityName) {

   var schedule_method = function(deciderParams, swfParams) {

      var n1 = g.addNode( deciderParams.name+"\\n"+activityName);
      n1.set( "style", "filled" );

      nodes[deciderParams.name] = n1;

      // Conditions as edges
      if (deciderParams.after) {
             if(typeof deciderParams.after === "string") {
               g.addEdge( nodes[deciderParams.after], n1 );
            }
            else {
               for(var cdtName in deciderParams.after) {
                  g.addEdge( nodes[cdtName], n1 );
               }
            }
      }

   };

   var split = activityName.split('_');

   if(split.length === 2) {
       var namespace = split[0],
           methodName = split[1];

       if(!sandbox[namespace]) {
           sandbox[namespace] = {};
       }
       sandbox[namespace][methodName] = schedule_method;
   }
   else {
       sandbox[activityName] = schedule_method;
   }

});

try {
   vm.runInNewContext(deciderCode, sandbox, 'graph.vm');
} catch (ex) {
   console.log(ex);
}

//console.log( g.to_dot() ); 

// Set GraphViz path (if not in your path)
g.setGraphVizPath( "/usr/local/bin" );

// Generate a PNG output
g.output( "png", "test01.png" );
