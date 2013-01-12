
var worker = require('./google').pagerank;


var task = {

    config: {
        input: JSON.stringify({
            url: "http://www.clicrdv.com"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log( JSON.stringify(results, null, 3) );
    }
};

worker(task);
