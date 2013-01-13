#!/usr/bin/env node

var vm = require('vm'),
    fs=require('fs'),
    graphviz = require('graphviz');

var deciderCode = fs.readFileSync(process.argv[2]);

var g = graphviz.digraph("G");
var nodes = {
   "start": g.addNode('start'),
   "end": g.addNode('end')
};

nodes.start.set('shape', 'Mdiamond');
nodes.end.set('shape', 'Mdiamond');

function addEdgeConditions(conditions, n) {
   // Conditions as edges
   var after_modules = [];

   if(typeof conditions === "string") {
      after_modules.push(conditions);
   }
   else if(Array.isArray(conditions)) {
      after_modules = conditions;
   }
   else {
      after_modules = Object.keys(conditions);
   }

   after_modules.forEach(function(m) {
      g.addEdge( nodes[m], n);
   });
}

function addNode(params, n) {
   nodes[params.name] = n;

   if (params.after && ( !Array.isArray(params.after) || params.after.length > 0 ) ) {
      addEdgeConditions(params.after, n);
   }
   else {
      addEdgeConditions(["start"], n);
   }
}

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
      var n = nodes.end;
      if (stopParams.after) {
         addEdgeConditions(stopParams.after, n);
      }
   },
   results: function () { return {}; },
   workflow_input: function () { return {}; }
};


try {
   vm.runInNewContext(deciderCode, sandbox, 'graph.vm');
} catch (ex) {
   console.log(ex);
}

//console.log( g.to_dot() ); 

// Set GraphViz path (if not in your path)
//g.setGraphVizPath( "/usr/local/bin" );
g.setGraphVizPath( "/opt/local/bin" );

// Generate a PNG output
g.output( "png", process.argv[2]+".png" );
