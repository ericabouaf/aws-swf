var path = require('path');

exports.fetch_config = function (workerName, cb) {
  var conf;
  try {
    // get config.json if exists
    conf = require(path.join(process.cwd(), workerName, 'config.js'));
  } catch (ex) {
    conf = {};
  }
  cb(null, conf);
};
