
var worker = require('./s3').createBucket;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            Bucket: 'enter-a-unique-bucket-name'
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results, null, 3) );
    }

};

worker(task, config);
