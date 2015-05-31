var express = require('express');
var configurator = require('./modules/config');
var path = require('path');
var expressWinston = require('express-winston');
var passport = require('passport');

var appDir = path.dirname(require.main.filename);
var environment = process.env.IIIF_ENV ?  process.env.IIIF_ENV : "development";
var logger = console;

var configFile = path.join(appDir, "config", "iiif-node.json");
var serviceConfig = configurator(configFile, environment);

var app = express();

function randString(x){
    var s = "";
    while(s.length<x&&x>0){
        var r = Math.random();
        s+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
    }
    return s;
}

serviceConfig.get("logger")
	.then(function(logconfig) {
		var logCreator = require("./modules/log")(logconfig);
		console.log("Logger: " + logCreator);
		logger = logCreator.get("main");
		logger.debug("Environment: " + environment + " - set IIIF_ENV to change");
		logger.info("Loading config from: " + path.join(appDir, "config", "iiif-node.json"));
		var webLogger = logCreator.get("web");
		app.use(function(req, res, next) {
			webLogger.info("%s -  %s - %s", req.httpVersion, req.method, req.url);
			next();
		});
		return serviceConfig.get("client");
	})
	.then(function(staticPath) {
		logger.info("Serving client from: " + staticPath);
		app.use(express.static(staticPath));
		return serviceConfig.get("iiif-server");
	})
	.then(function(imgConfig) {
		logger.info("Configuring IIIF Services: " + JSON.stringify(imgConfig));
		IIIFServer = require('./modules/iiif-server');
		iiifServer = IIIFServer(imgConfig);
		return iiifServer.setup();
	})
	.then(function(serverReady) {
		logger.info('IIIF Service State: ' + JSON.stringify(serverReady));
		return serviceConfig.get('authentication');
	})
	.then(function(userConfig) {
		logger.info('Preparing authentication: ' + userConfig.username);
		return require('./modules/auth')(userConfig, passport);
	})
	.then(function(authConfigured) {
		logger.info('Authentication configured');
		return serviceConfig.get("server.port", "3000");
	})
	.then(function(serverPort) {

		// Configure some middleware
		var session = require('express-session');
		var flash    = require('connect-flash');
		var cookieParser = require('cookie-parser');

		app.use(cookieParser());		
		// Don't care about keeping sessions over restarts,
		// just create a random session key.
		app.use(session({ secret: randString(64), resave: true, saveUninitialized: true }));
                app.use(passport.initialize());
                app.use(passport.session());
                app.use(flash()); 

		// Ok - everything is setup, mount the routes
		app.use('/auth', require('./routes/auth')(app, passport));		
		app.use('/iiif', require('./routes/iiif-api')(app, passport));		

		var server = app.listen(serverPort, function () {
		    var host = server.address().address;
		    var port = server.address().port;
		    logger.info('Example app listening at http://%s:%s', host, port);

		});
	});
