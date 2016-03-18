'use strict;'

var logger = require('../../../log')().get('modules');
var imagemagick = require('imagemagick-native');

var Exporter = function() {

}

Exporter.prototype = {
	transform: function(transformer, exportConfig, data, response, config) {

		var options = exportConfig.output.split('.');
		logger.debug('Options: ' + options);
		if ( options.length != 2 ) {
			logger.warn('Wrong export format: ' + exportConfig.output);
			response.writeHead(400);
			response.end("Badly formatted IIIF request");
			return;
		}

		var quality = options[0];
		var format =  options[1].toLowerCase();
		transformer.background({r: 255, g: 255, b: 255, a: 1});
		switch(quality) {
			case 'gray':
				transformer.gamma().grayscale();
				break;
			case 'bitonal':
				transformer.threshold(128);
				break;
			case 'default':
			case 'color':
				break;
			default:
				logger.warn('Unsupported quality: "' + quality +'"');
				response.writeHead(400);
				response.end("Badly formatted IIIF request");
				return;
		}

		// Write the canonical link to the image
		response.setHeader('Link',  [
			'<' + config.baseuri + exportConfig.url + '>;rel="canonical"',
			'<' + config.profileLink + '>;rel="profile"'
		]);

		switch(format) {
			case 'png':
				response.setHeader('content-type', 'image/png');
				transformer.toFormat('png').pipe(response);
				break;
			case 'jpg':
				response.setHeader('content-type', 'image/jpeg');
				transformer.toFormat('jpeg').pipe(response);
				break;
			case 'tiff':
			case 'tif':
				response.setHeader('content-type', 'image/tiff');
				var imStream = imagemagick.streams.convert({
                                  format: 'TIFF'
                                });
				transformer.toFormat('png').pipe(imStream).pipe(response);
				break;
			case 'gif':
				response.setHeader('content-type', 'image/gif');
				var imStream = imagemagick.streams.convert({
                                  format: 'GIF'
                                });
				transformer.toFormat('png').pipe(imStream).pipe(response);
				break;
			case 'pdf':
				response.setHeader('content-type', 'application/pdf');
				var imStream = imagemagick.streams.convert({
                                  format: 'PDF'
                                });
				transformer.toFormat('png').pipe(imStream).pipe(response);
				break;
			/** There are currently disabled due to the ImageMagick support level **/
			/**	
			case 'webp':
				response.setHeader('content-type', 'image/webp');
				transformer.toFormat('webp').pipe(response);
				break;
			case 'jp2':
				response.setHeader('content-type', 'image/jp2');
				var imStream = imagemagick.streams.convert({
                                  format: 'JP2'
                                });
				transformer.toFormat('png').pipe(imStream).pipe(response);
				break;
			**/
			default:
				logger.warn('Unsupported format: "' + format +'"');
				response.writeHead(400);
				response.end("Badly formatted IIIF request");
		};

	}
}

module.exports = Exporter;
