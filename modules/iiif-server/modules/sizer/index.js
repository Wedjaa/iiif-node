'use strict;'

var logger = require('../../../log')().get('modules');

var Sizer = function() {

}

Sizer.prototype = {
	resize: function(transformer, config, data) {

		if ( config.size === 'full' ) {
			return true;
		}

		var xSize, ySize;	

		if ( config.size.indexOf('pct:') === 0 ) {
			var pctSizeStr = config.size.replace(/pct:/, '');
			try  {
				var sizeRatio = parseFloat(pctSizeStr) / 100;
				xSize = Math.ceil(data.width * sizeRatio);
				ySize = Math.ceil(data.height * sizeRatio);
			} catch (error) {
				logger.warn('Failed to parse image resize: ' + JSON.stringify(config));
				return false;
			}	
		} else {
			var sizeExpr = config.size;
			var fitting;
			if ( sizeExpr.indexOf('!') === 0 ) {
				fitting = true;
				sizeExpr = sizeExpr.replace(/!/, '');
			}
			if ( sizeExpr.indexOf(',') < 0 ) {
				logger.warn('Failed to parse image resize, missing comma : ' + JSON.stringify(config));
				return false;
			}
			var limits = sizeExpr.split(',');
			if ( fitting && 
				( typeof limits[0] === 'undefined' || typeof limits[0] === 'undefined' ) ) {
				logger.warn('Failed to parse image resize fitting requires 2 limits: ' + JSON.stringify(config));
				return false;
			}
			xSize = limits[0].length ? parseInt(limits[0]) : undefined;
			ySize = limits[1].length ? parseInt(limits[1]) : undefined;	
		}	

		if ( typeof xSize === 'undefined' || typeof ySize === 'undefined' ) {
			fitting = true;
		}

		logger.debug('Resize: ' + xSize +', ' +ySize + ' Fitting: ' + fitting);
		transformer.resize(xSize, ySize);

		if ( fitting ) {
			transformer.max()
		} else {
			transformer.ignoreAspectRatio();
		}

		return true;
	}
}

module.exports = Sizer;
