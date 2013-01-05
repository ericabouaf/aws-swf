
// phantomjs --webdriver=4444
// or
// java -jar  selenium-server-standalone-2.28.0.jar -Dwebdriver.chrome.driver=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

var webdriver = require('wd')
, fs = require('fs')
  , assert = require('assert');

var browser = webdriver.remote('localhost', 4444);

browser.on('status', function(info){
  console.log('\x1b[36m%s\x1b[0m', info);
});
browser.on('command', function(meth, path){
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
});

desired = {
  browserName:'firefox'
  , tags: ["examples"]
  , name: "This is an example test"
};

browser.init(desired, function(err, sessionID) {
   console.log(sessionID);
  browser.get("http://www.neyric.com", function() {
    browser.title(function(err, title) {
      //assert.ok(~title.indexOf('I am a page title - Sauce Labs'), 'Wrong title!');
      browser.elementById('i am a link', function(err, el) {
        browser.clickElement(el, function() {
          browser.eval("window.location.href", function(err, location) {
            console.log(title, location);
            //assert.ok(~location.indexOf('guinea-pig2'));

            browser.takeScreenshot(function(err, screenshot) {

               fs.writeFileSync('test.png', new Buffer(screenshot, 'base64').toString('binary'), 'binary');

               //console.log(screenshot);
               browser.quit();               
            })

          });
        });
      });
    });
  });
});