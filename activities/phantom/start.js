#!/usr/bin/env node

var dnode = require('dnode');
var phantom = require('node-phantom');


var instances = [];
var pages = [];

var query = 0;

var server = dnode({
   
    createInstance : function (url, cb) {
        console.log("createInstance " + url );
        var instanceId = instances.length;
        
        instances.push(
           
           phantom.create(function(err, ph) {
              ph.createPage (function(err, page) {
                 page.open(url, function (err, status) {
                    console.log("==============");
                    console.log("PAGE OPEN (instanceId: "+instanceId+")")
                    pages.push(page);
                    console.log("cb ");
                    
                    setTimeout(function() {
                       cb(null, instanceId);
                    },2000);
                 });
              });
           })
        
        );
        
    },
    
    
    evaluate : function(instanceId, fn, cb) {
       
       console.log("==============");
       console.log("EVALUATE instanceId: "+instanceId);
       console.log(fn);
       
       if(typeof instanceId != "number") {
          console.log("Wrong instanceId !");
          return;
       }
       
       var f = eval("("+fn+")");
       
       var page = pages[instanceId];
       
       if(!page){
           console.log(" instanceId not found !");
           return;
        }
       
       page.evaluate(f, function(err, res) {
         
         console.log("evaluate RESULTS", err, res);
         
         page.render(__dirname+"/"+(query++)+".png", function() {
            setTimeout(function() {
                 cb(null, res);
              },2000);
         });
         
      });
       
       
    }
    
    
    
    
});
server.listen(5004);

console.log("PhantomJS manager started !");
