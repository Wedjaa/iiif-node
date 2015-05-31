var LogCreator = function(log_config) {

	if (!log_config) {
		console.log('Warning: creating a dummy logger - not log config was passed');
		return;
	}

	this.creator = require('./' + log_config.module)(log_config.config);
	this.logger = this.creator.get('module');
	this.logger.info('Logger ' + log_config.module + ' configured and started');
}

LogCreator.prototype.get = function(category) {
	if (!this.creator) {
		return this;
	}
	return this.creator.get(category);
}

LogCreator.prototype.error = function() {
	console.log(arguments);
}

LogCreator.prototype.info = function() {
	console.log(arguments);
}

LogCreator.prototype.warn = function() {
	console.log(arguments);
}

LogCreator.prototype.debug = function() {
	console.log(arguments);
}

LogCreator.prototype.trace = function() {
	console.log(arguments);
}


var logCreatorInstance;

module.exports = function(log_config) {
	if (!logCreatorInstance) {
		logCreatorInstance = new LogCreator(log_config);
	}
	return logCreatorInstance;
}
