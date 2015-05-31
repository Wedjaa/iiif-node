'use strict;'

var logger = require('../log')().get('modules');
var Extractor  = require('./modules/extractor');
var Sizer  = require('./modules/sizer');
var Rotator = require('./modules/rotator');
var Exporter = require('./modules/exporter');

var Promise = require('bluebird').Promise;
var sharp = require('sharp');
var path = require('path');

var IIIFServer = function(config) {
	this.config = config;
}

IIIFServer.prototype = {

	// Prepare the server
	setup: function() {
		this.extractor = new Extractor();
		this.sizer = new Sizer();
		this.rotator = new Rotator();
		this.exporter = new Exporter();
		this.initialized = true;
	},

	cacheTile: function(tile, params) {
	},

	getInfo: function(exportConfig, response) {
		var self = this;
		logger.debug('Get Info: ' + JSON.stringify(exportConfig));
		return this.getImage(exportConfig)
			.metadata()
			.then(function(data) {
				response.writeHead( 200, {
					'Content-Type': 'application/json',
					'Link': '<http://iiif.io/api/image/2/context.json>' +
						'; rel="http://www.w3.org/ns/json-ld#context"' +
						'; type="application/ld+json"',
					'Access-Control-Allow-Origin': '*'
				});
				response.end(JSON.stringify({
					'@context': 'http://iiif.io/api/image/2/context.json',
					'@id': self.config.baseuri + '/' + exportConfig.image,
					'protocol': 'http://iiif.io/api/image',
					'profile': self.config.profile,
					'width': data.width,
					'height': data.height
				}));
			})
			.catch(function(err) {
				logger.debug('Error serving image information for "' + exportConfig.image + '": ' + err.message);
				response.writeHead( 404, {
					'Content-Type': 'application/json'
				});
				response.end(JSON.stringify({success: false, error: err.message}));
			});
	},

	getTile: function(exportConfig, response) {
		var self = this;
		logger.debug('Export Tile: ' + JSON.stringify(exportConfig));
		return this.getImage(exportConfig)
			.metadata()
			.then(function(data) {
				// Prepare the output
				logger.debug('Creating tile - ' + JSON.stringify(data));
				var transformer = self.getImage(exportConfig);
				logger.debug('Transformer ready for ' + exportConfig.image);
				if (!self.extractor.extract(transformer, exportConfig, data)) {
					response.writeHead(400);
					response.end("Badly formatted IIIF request");
					return;
				}
				logger.debug('Extractor configured - ' + exportConfig.region);
				if (!self.sizer.resize(transformer, exportConfig, data)) {
					response.writeHead(400);
					response.end("Badly formatted IIIF request");
					return;
				}
				logger.debug('Resizer configured - ' + exportConfig.size);
                                if (!self.rotator.rotate(transformer, exportConfig, data)) {
                                        response.writeHead(400);
                                        response.end("Badly formatted IIIF request");
                                        return;
                                }
				logger.debug('Rotator configured - ' + exportConfig.rotation);
				self.exporter.transform(transformer, exportConfig, data, response);
			})
			.catch(function(err) {
				logger.debug('Error serving image for "' + exportConfig.image + '": ' + err.message);
				response.writeHead( 404, {
					'Content-Type': 'application/json'
				});
				response.end(JSON.stringify({success: false, error: err.message}));
			});
	},

	getImage: function(exportConfig) {
		var imagePath = path.join(this.config.source, exportConfig.image);
		logger.debug('Starting from image: ' + imagePath);
		return sharp(imagePath);
	},

	// Gets the JPEG2000 version of
	// and image, generating it if it's
	// needed.
	getJpeg: function(imagePath) {
		
	}
}

var iiifServerInstace;

module.exports = function(config) {

	if ( typeof iiifServerInstance === 'undefined' ) {
		iiifServerInstance = new IIIFServer(config);
	}

	return iiifServerInstance;	
}

