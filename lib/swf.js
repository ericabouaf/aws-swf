var path = require("path"),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path');

var find = function(dir, file) {
    
    var files = fs.readdirSync(dir),
        possibleFiles = files.filter(function(f) { return f === file; });

    if (possibleFiles.length > 0) {
        return path.join(dir, possibleFiles[0]);
    }
    else {
        var next = path.join(dir, '../');
        if (dir === next) {
            return null;
        }
        return find(next, file);
    }
};

/**
 * Create a AWS SWF client using aws-sdk.
 * This method we look up the path hierarchy to find a ".aws-swf.json" file containing the access credentials
 */
exports.createClient = function (obj) {
    var swfClient = new AWS.SimpleWorkflow();

    return swfClient;
};

