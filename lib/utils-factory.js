var retry = require('retry');

exports.utils = {
    getRetryHelper: function(cb) {
        return retry.operation()
    }
}
