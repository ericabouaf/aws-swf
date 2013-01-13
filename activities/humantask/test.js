var worker = require('./humantask').worker;

var config = require('./config');

var task = {

   config: {

      taskToken: "1A8B6I45A665V536I3J5HF65SD3F25J5H32Q3D5G9DF8H5G22AQ3XW2VCXB266",

      input: JSON.stringify({

         "email-notification": {
            to: "eric.abouaf@gmail.com",
            subject: "Ceci est un test !"
         }/*,

         template: "<b>BOudiou</b>"*/
      })
   },

   respondCompleted: function (results) {
      console.log("Done !");
      console.log(results);
   }

};


worker(task, config);
