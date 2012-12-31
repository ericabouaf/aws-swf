
var worker = require('./notifo').worker;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            to: "neyric",
            msg: "Yo, this is a test !",
            label: "AWS-SWF",
            title: "New Notification",
            uri: "http://www.github.com"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);
