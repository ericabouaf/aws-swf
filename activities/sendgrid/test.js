
var worker = require('./sendgrid').worker;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            to: 'eric.abouaf@gmail.com',
            from: 'test@clicrdv.com',
            subject: 'Hello Sendgrid',
            text: 'My first email through SendGrid'
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);


