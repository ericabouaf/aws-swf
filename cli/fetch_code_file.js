
var fs = require('fs'),
    path = require('path');

exports.fetch_code =  function (workflowName, cb) {

    fs.readFile(path.join(process.cwd(), workflowName, workflowName + '.js'), cb);

};