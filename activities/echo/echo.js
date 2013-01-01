
exports.worker = function (task, config) {

   var result = task.config.input; // yes, echo is pretty dumb....

   task.respondCompleted(result);

};

