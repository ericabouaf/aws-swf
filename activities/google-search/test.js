
var worker = require('./google-search').worker;


var task = {

    config: {
        input: JSON.stringify({
            q: "service mapping description"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log( JSON.stringify(results, null, 3) );
    }
};

worker(task);
