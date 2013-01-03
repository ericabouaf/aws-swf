
var phantom = require('node-phantom'),
    prompt = require('prompt');

var url = "https://adwords.google.com/o/KeywordTool";

phantom.create(function(err, ph) {
  ph.createPage (function(err, page) {
     page.open(url, function (err, status) {

        setTimeout(function() {

            page.render(__dirname+"/p.png", function() {

               prompt.start();
               prompt.get(['captcha'], function (err, result) {

                  page.evaluate(eval("(function() {"+
                        "document.getElementsByClassName('gwt-TextBox')[0].value = "+JSON.stringify(result.captcha)+";"+
                        "document.getElementsByClassName('sJBB')[0].value = 'my keyword search';"+
                        "var button = document.getElementsByClassName('gwt-Button')[0];"+
                        "var e = document.createEvent('MouseEvents');"+
                        "e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);"+
                        "button.dispatchEvent(e);"+
                  "})"), function(err, res) {

                     setTimeout(function() {
                        page.render(__dirname+"/b.png", function() {
                           console.log("done !");
                        });
                     }, 10000);

                  });

               });

            });

        },10000);

     });
  });
});

