
var worker = require('./deathbycaptcha').worker;

var config = require('./config');


var task = {

    config: {
        input: JSON.stringify({
			url: "http://upload.wikimedia.org/wikipedia/commons/b/b6/Modern-captcha.jpg"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }
};

worker(task, config);
