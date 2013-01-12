
var worker = require('./swf').listDomains;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            registrationStatus: 'REGISTERED'
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results, null, 3) );
    }

};

worker(task, config);
