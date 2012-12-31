
var worker = require('./salesforce-query').worker;

var config = require('./config');

var task = {

    config: {
        input: "SELECT Id, Name FROM Account Limit 10"
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    },

    respondFailed: function () {
        console.log("Failed !");
        console.log(arguments);
    }


};

worker(task, config);
