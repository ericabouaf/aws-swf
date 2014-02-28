var AWS = require('aws-sdk');

/**
 * Create a AWS SWF client using the aws-sdk.
 */
exports.createClient = function () {
    var swfClient = new AWS.SimpleWorkflow();
    return swfClient;
};

