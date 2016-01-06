var retry = require('retry');

exports.utils = {
    getRetryHelper: function(retryInterval) {
        //TODO: Value set be configuable
        var retryInterval = retryInterval || 30
        return retry.operation({
            retries: retryInterval,
            maxTimeout: 60 * 1000
        })
    }
}
