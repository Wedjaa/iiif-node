var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var logger = require('../modules/log')().get('modules');
var iiifServer = require('../modules/iiif-server')();

module.exports = function(app, passport) {

        router.use(bodyParser.json({limit: '5mb'}));

        router.get('/:imagepath/info.json', function(req, res) {
		var exportConfig = {
			image: req.params['imagepath']
		};
		iiifServer.getInfo(exportConfig, res);
	});

        router.get('/:imagepath', function(req, res) {
		res.writeHead(302, {
		  'Location': req.originalUrl + '/info.json'
		});
		res.end();
	});

        router.get('/:imagepath/:region/:size/:rotation/:export', function(req, res) {
		var exportConfig = {
			image: req.params['imagepath'],
			region: req.params['region'],
			size: req.params['size'],
			rotation: req.params['rotation'],
			output: req.params['export']
		};

		iiifServer.getTile(exportConfig, res);
        });

        return  router;
};

