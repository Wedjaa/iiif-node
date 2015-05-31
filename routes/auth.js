var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var logger = require('../modules/log')().get('modules');


module.exports = function(app, passport) {

	router.use(bodyParser.json({limit: '5mb'}));

	router.get('/user', function(req, res) {
		if (req.user) {
			res.json({success: true, message: 'Admin logged in', details: req.user});
			return;
		}
		res.json({success: false, message: 'Admin not logged in', details: {}});
	});

	router.post('/login', passport.authenticate('local'), function(req, res)  {
		res.json({success: true, message: 'Admin logged in', details: req.user});
	});


	router.get('/logout', function(req, res) {
	  req.logout();
	  res.json({success: true, message: 'Admin logged out', details: {}});
	});
	
	return  router;
};

