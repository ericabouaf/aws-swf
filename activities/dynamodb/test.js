
var worker = require('./dynamodb').listTables;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results, null, 3) );
    }

};

worker(task, config);
