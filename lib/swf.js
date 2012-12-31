var path = require("path"),
    AWS = require('aws-sdk');

exports.createClient = function (obj) {

    // If no config is passed, we'll get it from config.js
    if (!obj) {
        var configFilePath = path.join(__dirname, '..', 'config.js');
        try {
            obj = require(configFilePath);
        } catch (ex) {
            console.error("Config file not found : " + configFilePath + "\nCall 'swf-set-credentials', or pass accessKeyId and secretAccessKey !");
            process.exit(1);
        }
    }

    if (!obj.region) {
        obj.region = "us-east-1";
    }

    AWS.config.update(obj); //{ "accessKeyId": "akid", "secretAccessKey": "secret", "region": "us-east-1" }
    
    var swfClient = new AWS.SimpleWorkflow();

    return swfClient;
};
