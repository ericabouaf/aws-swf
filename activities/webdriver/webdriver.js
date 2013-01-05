
var webdriver = require('wd');

function getBrowser() {

  var browser = webdriver.remote('localhost', 4444);

  browser.on('status', function(info){
    console.log('\x1b[36m%s\x1b[0m', info);
  });
  browser.on('command', function(meth, path){
    console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
  });

  return browser;
}



exports.init = function (task, config) {

   var input = JSON.parse(task.config.input);

   var browser = getBrowser();

   /*var desired = {
      browserName:'firefox'
      , tags: ["examples"]
      , name: "This is an example test"
    };*/

  browser.init({}, function(err, sessionID) {
    browser.get("http://www.neyric.com", function() {
    });
  });

};

exports.eval = function (task, config) {

   var input = JSON.parse(task.config.input);

   var browser = getBrowser();

   browser.sessionID = input.sessionID;

   browser.eval("window.location.href", function(err, location) {
   });


 };

      //clickElement(el, function() {
          //takeScreenshot(function(err, screenshot) {
            // quit();



   /*var d = dnode.connect(5004);
   d.on('remote', function (remote) {
       
       if(input.create) {
          remote.createInstance(input.url, function (err, instanceId) {
               d.end();

               task.respondCompleted({instanceId: instanceId});
           });
       }
       else {
           remote.evaluate(input.instanceId, input.fnString, function (err, results) {
               d.end();

               task.respondCompleted({results: results});
           });
       }
       
   });*/
   
