'use strict;'

var logger = require('../../../log')().get('modules');

var Extractor = function() {

}


Extractor.prototype = {
	extract: function(transformer, exportConfig, metadata) {
		// Get our parameter
		var region = exportConfig.region;

		if (region === 'full') {
			// Nothing to do here
			return true;
		}

		var xOffset, yOffset, width, height;

		if ( region.indexOf('pct:') === 0 ) {
			region = region.replace(/pct:/, '');
			var pctCoords = region.split(',');
			logger.debug('Percent crop raw: ' + pctCoords);
			if ( pctCoords.length !== 4 ) {
				logger.warn('Wrong region coordinates requested - ' + JSON.stringify(exportConfig));
				return false;;
			}
			if ( pctCoords[0] > 100 || 
				pctCoords[1] > 100 || 
				pctCoords[2] > 100 || 
				pctCoords[3] > 100 ) {
				logger.warn('Wrong region coordinates, 100 is the sky - ' + JSON.stringify(exportConfig));
				return false;
			}
			try {
				var xOffPct = parseFloat(pctCoords[0]);
				var yOffPct = parseFloat(pctCoords[1]);
				var widthPct = parseFloat(pctCoords[2]);
				var heightPct = parseFloat(pctCoords[3]);
				logger.debug('Percent Crop: ' + xOffPct +', '+yOffPct+' - ' + widthPct + 'x' + heightPct);
				xOffset = Math.floor(metadata.width * parseFloat(pctCoords[0]) / 100);
				yOffset = Math.floor(metadata.height * parseFloat(pctCoords[1]) / 100);
				width = Math.floor(metadata.width * parseFloat(pctCoords[2]) / 100);
				height = Math.floor(metadata.width * parseFloat(pctCoords[3]) / 100);
			} catch (error) {
				logger.warn('Wrong region coordinates,  ' + error.message + ' - returning full size - ' + JSON.stringify(exportConfig));
				return false;
			}
		} else {
			var pixCoords = region.split(',');
			logger.debug('Absolute crop: ' + pixCoords);
			if ( pixCoords.length !== 4 ) {
				logger.warn('Wrong region coordinates requested - ' + JSON.stringify(exportConfig));
				return false;
			}
			try {
				xOffset = parseInt(pixCoords[0]);
				yOffset = parseInt(pixCoords[1]);
				width = parseInt(pixCoords[2]);
				height = parseInt(pixCoords[3]);
			} catch (error) {
				logger.warn('Wrong region coordinates,  ' + error.message + ' - ' + JSON.stringify(exportConfig));
				return false;
			}
		}

		logger.debug('Image Size: ' + metadata.width + 'x' + metadata.height);
		logger.debug('Cropping [incoming]: ' + xOffset + ',' + yOffset + " - " + width + 'x' + height);

		// Outside the image boundaries
		if ( xOffset > metadata.width || yOffset > metadata.height ) {
			return false;
		}

		if ( xOffset + width > metadata.width ) {
			width = metadata.width - xOffset;
		}

		if ( yOffset + height > metadata.height ) {
			height = metadata.height - yOffset;
		}

		if ( height === 0 || width === 0 ) {
			return false;
		}

		logger.debug('Cropping: ' + xOffset + ',' + yOffset + " - " + width + 'x' + height);
		transformer.extract(yOffset, xOffset, width, height);
		return true;
	}
}

module.exports = Extractor;
