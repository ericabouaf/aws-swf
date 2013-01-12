
var worker = require('./google').suggest;


var task = {

    config: {
        input: JSON.stringify({
            q: "roger federer"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log( JSON.stringify(results, null, 3) );
    }
};

worker(task);
