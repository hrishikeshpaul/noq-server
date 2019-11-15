var mongoose = require('mongoose');
var passport = require('passport');
var settings = require('../config/settings');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/User");
var imgur = require('imgur');


// Setting
imgur.setClientId('77457873b7895a0');

// Getting
imgur.getClientId();


imgur.setAPIUrl('https://api.imgur.com/3/');

// A single image
var imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAmUlEQVQ4je2TsQ3CMBBFnxMa08WR2IQKJskIUNwMZAcYwWIQMs65JCUpEEIYW4pJy6v+6e6+/hVnnGsAzsCBMi7AsbbW/rIMsAU2xrnmkeruuzW7zgIw+JGbv6fGQpWzfy3HOsJlDQY/AlCv3jpF9oS5ZBOICKoB1YCIlCdQDR9127qyBHP5Gyw3CBXPr/qi709JHXE1S995AsqoJu8x78GsAAAAAElFTkSuQmCC'
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	//console.log(req.body.user);

	imgur.uploadBase64(req.body.image)
		.then(function (json) {
			console.log(json.data.link);
			User.findOne({ id: req.body.user }, function (err, user) {

				if (err) {
					console.log
					return res.status(400).send('Error')
				}
				else {
					console.log('In here')
					user.updateOne({ $set: { profilepicture: `${json.data.link}` } }, function (err, success) {
						console.log(`updated!!: ${json.data.link}`);

					})
					return res.send(user)

				}
			})
		})
		.catch(function (err) {
			console.error(err.message);
		});



	//res.send('hiiii')
})
module.exports = router;
