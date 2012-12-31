
var worker = require('./http-request').worker;

var task = {

    config: {

        input: JSON.stringify({
            url: "http://query.yahooapis.com/v1/public/yql",
            data: {
                q: 'show tables',
                format: 'json'
            }
        })

    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results));
    }

};

worker(task);
