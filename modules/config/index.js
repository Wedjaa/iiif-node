var Promise = require('bluebird');
var fs = require('fs');

function cloneConfiguration(originalConfig) {
  var clonedConfig = {};

  for ( var property in originalConfig ) {
	if ( originalConfig[property].constructor == Object ) {
		clonedConfig[property] = cloneConfiguration(originalConfig[property]);
	} else {
		clonedConfig[property] = originalConfig[property];
	}
  }

  return clonedConfig;
}

function mergeConfigurations(defaultConfig, envConfig) {

  var mergedConfig = cloneConfiguration(defaultConfig);

  for (var property in envConfig) {
      if ( envConfig[property].constructor == Object ) {
        mergedConfig[property] = mergeConfigurations(mergedConfig[property], envConfig[property]);
      } else {
	if ( envConfig[property].constructor == Array ) {
		mergedConfig[property] = mergedConfig[property].concat(envConfig[property])
	} else {
		mergedConfig[property] = envConfig[property];
	}
      }
  }

  return mergedConfig;
}

function getValueByPath(object, path, defaultValue) {
	if ( !Array.isArray(path) ) {
		path = path.split(".");
	}
	var currentValue = object[path[0]];
	if ( currentValue !== 'undefined' ) {
		if ( path.length == 1 ) {
			return currentValue;
		}
		return getValueByPath(currentValue, path.splice(1));
	} else {
		return defaultValue;
	}
}

var Configurator = function(configFile, env) {
	this.configFile = configFile;
	this.environment = env;
}

Configurator.prototype.get = function(property, defaultValue) {
	var self = this;

	return new Promise(function (resolve, reject) {
		if ( self.config ) {
			resolve(getValueByPath(self.config, property,  defaultValue));
			return;
		}
		self.loadConfig()
		  .then(function() {
			resolve(getValueByPath(self.config, property,  defaultValue));
		   })
		   .catch(function(error) {
			resolve(defaultValue);
		   });
	});

};

Configurator.prototype.loadConfig = function() {
	var self = this;

	return new Promise(function (resolve, reject) {
		fs.readFile(self.configFile, { encoding: 'utf-8' }, function(err, data) {
			if (err) {
				reject("Error reading config file ["+self.configFile+"] - " + err.toString());
				return;
			}

			resolve(self.parseConfig(data));
		});
	});
};

Configurator.prototype.parseConfig = function(fileData) {

	var self = this;

	return new Promise(function (resolve, reject) {
		var configObject = {};
		try {
			configObject = JSON.parse(fileData);
		} catch (err) {
			reject(new Error("Failed to parse configuration: " + err.toString()));
			return;
		}
		var defaultOptions = configObject.defaults ? configObject.defaults : {};
		var envOptions = configObject[self.environment] ? configObject[self.environment] : {};
		self.config = mergeConfigurations(defaultOptions, envOptions);
		resolve(self.config);
	});
}

var configurators = {};

module.exports = function(configFile, env) {
	var configKey = configFile+"_"+env;
	if ( !configurators[configKey] ) {
		configurators[configKey] = new Configurator(configFile, env);
	}
	return configurators[configKey];
}
