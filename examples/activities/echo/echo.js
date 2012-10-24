
exports.worker = function (task) {

	var result = task.config.input; // yes, echo is pretty dumb....

	task.respondCompleted(result);

};

