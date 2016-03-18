var fs = require('fs');
var path = require('path');

var winston = require('winston');

function createPath(configuration) {
  if (typeof configuration.file !== 'undefined'
	&& typeof configuration.file.filename !== 'undefined') {
	// It's a file logger, make sure we create the path where we need
	// to write the logs if it doesn't exist.
	var logPath = path.normalize(path.dirname(configuration.file.filename));
	if (!fs.existsSync(logPath)){
    		fs.mkdirSync(logPath);
	}
  }
}

var WinstonLogger = function(configuration) {
	for ( var category in configuration ) {
		var categoryConfig = configuration[category];
		winston.loggers.add(category, categoryConfig);
		createPath(categoryConfig);
	}
}

WinstonLogger.prototype.get = function(category) {
	return winston.loggers.get(category);
}

var logger = undefined;

module.exports = function(configuration) {
    if ( !logger ) {
	logger = new WinstonLogger(configuration);
    }
    return logger;
}

