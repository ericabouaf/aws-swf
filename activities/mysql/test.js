
var worker = require('./mysql').worker;

var config = require('./config');

var task = {

    config: {
        input: "SHOW TABLES"
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);
