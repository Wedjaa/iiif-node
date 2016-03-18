'use strict;'

var logger = require('../../../log')().get('modules');

var supportedRotationAngles = [ 0, 90, 180, 270 ];
var Rotator = function() {

}

Rotator.prototype = {
	rotate: function(transformer, config, metadata) {

		if ( config.rotation === '0' ) {
			return true;
		}

		if ( config.rotation.indexOf('!') === 0 ) {
			logger.debug('Flipping image');
			transformer.flop();
		}

		var rotation = config.rotation.replace(/!/, '');

		if ( rotation === '0' ) {
			return true;
		}

		var rotationNum = 0;

		try  {
			rotationNum = parseInt(rotation);	
		} catch(error) {
			logger.warn('Failed to parse image rotation: ' + JSON.stringify(config));
			return false;
		}

		if ( supportedRotationAngles.indexOf(rotationNum) < 0 ) {
			logger.warn('Unsupported rotation angle: ' + rotationNum);
			return false;
		}

		logger.debug('Rotating image: ' + rotationNum);

		transformer.rotate(rotationNum);
		return true;
	}
}

module.exports = Rotator;
