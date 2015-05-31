var LocalStrategy   = require('passport-local').Strategy;
var Promise = require('bluebird').Promise;
var logger = require('../log')().get('modules');

module.exports = function(userConfig, passport) {

	return new Promise(function (resolve, reject) {

		passport.serializeUser = function(user, req, done) {
			logger.debug('serialize: ' + JSON.stringify(user));
			done(null, 'admin');
		};

		passport.deserializeUser = function(id, req, done) {
			logger.debug('deserialize: ' + JSON.stringify(id));
			done(null, { username: userConfig.username, role: 'admin'});
		};

		passport.use(new LocalStrategy({
			usernameField : 'username', 
			passwordField : 'password',
			passReqToCallback : true
		}, function(req, username, password, done) {
			logger.debug('Authenticating: ' + username);
			if ( username !== userConfig.username  ||
				password !== userConfig.password ) {
				done(null, false, req.flash('loginMessage', 'Error logging you in, sorry dude!'));
				return;
			}
			done(null,{ username: userConfig.username, role: 'admin'});
		}));

		logger.debug('Returning configured passport');
		resolve(passport);

	});

}
