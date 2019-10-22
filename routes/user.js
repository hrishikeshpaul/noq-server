var passport = require('passport')
require('../config/passport')(passport)
var express = require('express')
var router = express.Router()
var User = require('../models/User');


router.patch('/:id', function (req, res, next) {
	console.log(req.params.id)

	console.log(req.body)
	User.updateOne({ _id: req.params.id }, { $set: req.body }, function (err, success) {
		if (err)
			return res.status(400).send('Error inn updating user')
		return res.status(204).send(JSON.stringify(success))
	})
})

module.exports = router
