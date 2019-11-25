
var passport = require('passport')
require('../config/passport')(passport)
var express = require('express')
var router = express.Router()

var Feedback = require('../models/Feedback');

router.post('/feedback', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	new Feedback(req.body).save(function (err, feedback) {
		if (err)
			return res.status(400).send('Server Error')
		return res.status(201).send(feedback)
	})
})

module.exports = router