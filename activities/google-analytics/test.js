
var worker = require('./google-analytics').worker;

var config = require('./config');


var task = {

    config: {
        input: JSON.stringify({
            "ids": "ga:24583775",
            "start-date": "2011-01-01",
            "end-date": "2012-06-30",
            "metrics": "ga:visits",
            "dimensions": "ga:nthMonth",
            "filters": "ga:pagePath=@FRYROC"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }
};

worker(task, config);
