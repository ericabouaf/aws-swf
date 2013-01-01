
var worker = require('./mturk-createhit').worker;

var config = require('./config');



var task = {

   taskToken: "1A8B6I45A665V536I3J5HF65SD3F25J5H32Q3D5G9DF8H5G22AQ3XW2VCXB266",

    config: {
        input: JSON.stringify({
            title : 'Extract Information from a Receipt',
            description : 'If the receipt is absolutely unreadable do mark it as unreadable. We will inform the user that he needs to take a better picture./Text',
            reward : 0.02,
            duration: 3600, /* 1 hour*/

            options: {
              keywords: "fitness, health",
              autoApprovalDelayInSeconds: 3600
            }

            /*,

            questionData: {
               receipt: {
                  imageURL: 'http://www.act1.net/screens/ReceiptPage.gif',
                  imageSubType: 'gif'
               }
            }*/
            
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);
