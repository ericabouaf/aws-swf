
var worker = require('./nodemailer').worker;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            to: "eric.abouaf@gmail.com",
            subject: "Hello from email worker",
            text: "not shown in most mail reader",
            html: "<a href='http://localhost:8124/'>This is much cooler</a>"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);


