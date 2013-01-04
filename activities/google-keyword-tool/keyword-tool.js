
var phantom = require('node-phantom'),
    prompt = require('prompt');


function getResults(page, ph) {

   page.evaluate(function(){

      /*function parseTable(table) {
         var results = [];
         var searchRows = table.children[2].rows;

         for(var i = 0 ; i < searchRows.length; i++) {
            var searchRow = searchRows[i],
                cells = searchRow.cells;

            try {
               var keyword = cells[1].children[0].children[0].children[0].children[1].children[0].innerHTML.replace('<b>','').replace('</b>', '');
            }
            catch(ex) {}

            try {
            var concurence = cells[2].children[0].children[0].children[0].innerHTML;
            }
            catch(ex) {}

            try {
            var concurenceLevel = cells[2].children[0].children[0].children[0].title;
            }
            catch(ex) {}

            try {
            var worldSearchVolume = cells[3].children[0].children[0].innerHTML.replace(/&nbsp;/g, '');
            }
            catch(ex) {}

            try {
            var zoneSearchVolume = cells[4].children[0].children[0].innerHTML.replace(/&nbsp;/g, '');
            }
            catch(ex) {}

            results.push({
               keyword: keyword,
               concurence: concurence,
               concurenceLevel: concurenceLevel,
               worldSearchVolume: worldSearchVolume,
               zoneSearchVolume: zoneSearchVolume
            });

         }
         return {
            children: !!table.children,
            searchRows: !!searchRows,
            results: results
         };
      }

      try {
         var tables = document.getElementsByClassName('sBPB');
         var data = {
            search: parseTable(tables[0])
         };
         if (tables.length > 1) {
            data.ideas = parseTable(tables[1]);
         }

         return data;

      } catch(ex) {
         return ex.message;
      }*/


      return String(window.location);
   
   }, function(err, res) {

      console.log(JSON.stringify(res, null, 3));

      ph.exit(function(){
         console.log("Phantom exited !!");
         console.log("Have results ? ", typeof res !== "string");
      });

   });

}



function openKeywordTool(page, ph) {

   page.render(__dirname+"/p.png", function() {

      prompt.start();
      prompt.get(['captcha'], function (err, result) {

         page.evaluate(eval("(function() {"+
               "document.getElementsByClassName('gwt-TextBox')[0].value = "+JSON.stringify(result.captcha)+";"+
               "document.getElementsByClassName('sJBB')[0].value = 'defibrillator\\ndefibrillator toaster\\ndefibrillator toaster for sale';"+
               "var button = document.getElementsByClassName('gwt-Button')[0];"+
               "var e = document.createEvent('MouseEvents');"+
               "e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);"+
               "button.dispatchEvent(e);"+
         "})"), function(err, res) {

            setTimeout(function() {
               page.render(__dirname+"/b.png", function() {
                  getResults(page, ph);
               });
            }, 10000);

         });

      });

   });

}


var url = "https://adwords.google.com/o/KeywordTool";
phantom.create(function(err, ph) {
  ph.createPage (function(err, page) {
     page.open(url, function (err, status) {
        setTimeout(function() {
            openKeywordTool(page, ph);
        },10000);
     });
  });
});

