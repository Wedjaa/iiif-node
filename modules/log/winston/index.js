var winston = require('winston');

var WinstonLogger = function(configuration) {
	for ( var category in configuration ) {
		winston.loggers.add(category, configuration[category]);
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

