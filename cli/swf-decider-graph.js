#!/usr/bin/env node

var vm = require('vm'),
    fs=require('fs'),
    graphviz = require('graphviz');

var deciderCode = fs.readFileSync(process.argv[2]);


// Options are passed through graphOptions.json
// use 'results' as a hash of activity results
var graphWorkflowResults;
if( fs.existsSync('graphOptions.json') ) {
   var graphOptionsStr = fs.readFileSync('graphOptions.json').toString();
   var graphOptions = JSON.parse(graphOptionsStr);
   graphWorkflowResults = graphOptions.results;
}


var g = graphviz.digraph("G");
var nodes = {
   "start": g.addNode('start')
};

nodes.start.set('shape', 'Mdiamond');

function addEdgeConditions(scheduleParams, n) {
   
   var after = scheduleParams.after;

   // Conditions as edges
   var after_modules = [];

   if(typeof after === "string") {
      after_modules.push(after);
   }
   else if(Array.isArray(after)) {
      after_modules = after;
   }
   else if(typeof after === 'object') {
      after_modules = Object.keys(after);
   }

   after_modules.forEach(function(m) {
      var e = g.addEdge( nodes[m], n);

      if(scheduleParams.conditionStr) {
         e.set('label', scheduleParams.conditionStr);
      }

   });
}

function addNode(scheduleParams, n) {
   nodes[scheduleParams.name] = n;

   if (scheduleParams.after && ( !Array.isArray(scheduleParams.after) || scheduleParams.after.length > 0 ) ) {
      addEdgeConditions(scheduleParams, n);
   }
   else {
      addEdgeConditions({after: ["start"]}, n);
   }
}

var endCount = 1; // counter for the number of 'stop()' calls

var sandbox = {
   COMPLETED: 1,
   FAILED: 2,
   TIMEDOUT: 4,

   schedule: function (scheduleParams, swfParams) {      
      var n = g.addNode( scheduleParams.name+"\\n"+scheduleParams.activity);
      n.set( "style", "filled" );

      addNode(scheduleParams, n);
   },

   start_childworkflow: function (scheduleParams, swfParams) {
      var n = g.addNode( scheduleParams.name+"\\n"+scheduleParams.workflow);
      n.set( "style", "filled" );
      n.set( "shape", "Msquare" );
      
      addNode(scheduleParams, n);
   },

   start_timer: function (scheduleParams, swfParams) {
      
      var n = g.addNode( scheduleParams.name+"\\nTimer");
      n.set( "style", "filled" );
      n.set( "shape", "square" );

      addNode(scheduleParams, n);
   },

   stop: function (stopParams, swfParams) {

      var n = g.addNode('end'+endCount);
      endCount += 1;
      n.set('shape', 'Mdiamond');

      if (stopParams.after) {
         addEdgeConditions(stopParams, n);
      }
   },
   results: function (name) {
      if(graphWorkflowResults) {
         return graphWorkflowResults[name] || {};
      }

      return {};
   },
   workflow_input: function () { return {}; }
};


try {
   vm.runInNewContext(deciderCode, sandbox, 'graph.vm');
} catch (ex) {
   console.log(ex);
}

//console.log( g.to_dot() ); 

// Set GraphViz path (if not in your path)
g.setGraphVizPath( "/usr/local/bin" );
//g.setGraphVizPath( "/opt/local/bin" );

// Generate a PNG output
g.output( "png", process.argv[2]+".png" );
