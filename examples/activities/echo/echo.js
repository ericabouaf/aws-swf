
exports.worker = function (task) {

	var result = task.config.input; // yes, echo is pretty dumb....

	console.log(JSON.stringify(result, null, 3));

	task.respondCompleted(result);

};

