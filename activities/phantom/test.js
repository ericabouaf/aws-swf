
var worker = require('./phantom').worker;


// 1. Create a new page instance
worker({

    config: {
        input: JSON.stringify({
            create: true,
            url: 'http://www.google.com'
        })
    },

    respondCompleted: function (results) {

      var instanceId = results.instanceId;
      console.log("Instance #"+instanceId+" created !");

      setTimeout( function() {
         
         // 2. Return the current URL
         worker({
             config: {
                 input: JSON.stringify({

                     instanceId: instanceId, // instanceId of the page created before

                     // This code will be executed in the phantom context
                     fnString: String(function(){
                        document.getElementsByName('q')[0].value = 'aws-swf node.js';
                        return {
                           loc: String(window.location)
                        };
                     })
                 })
             },
             respondCompleted: function (results) {
                 console.log("Code evaluated: ", results);
             }

         });

      }, 2000);


    }

});
