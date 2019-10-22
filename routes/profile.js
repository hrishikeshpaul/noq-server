var mongoose = require('mongoose')
var passport = require('passport')
require('../config/passport')(passport)
var express = require('express')
var router = express.Router()
var User = require('../models/User');
var Education = require('../models/Education')
var Experience = require('../models/Experience')
const { check, validationResult } = require('express-validator')


router.post('/updateRole', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	console.log(req.body)
	User.findOneAndUpdate({ _id: req.body.user }, { $set: { role: req.body.role } }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		return res.status(204).send('Done')
	})
})
/*
* Only for name, company/university, website and social websites
* Fix social websites updating to blank if empty being sent
*/
router.post('/personal', passport.authenticate('jwt', { session: false }), function (req, res, next) {

	// removing keys that don't have a value to prevent false updates
	req.body.data = Object.entries(req.body.data).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {})
	// if object is empty then return an error
	if (Object.entries(req.body.data).length === 0 && req.body.data.constructor === Object) {
		return res.status(400).send('All Fields Can\'t Be Empty')
	}

	User.findOne({ _id: req.body.user.id }, function (err, profile) {
		if (profile) {
			User.updateOne({ _id: req.body.user.id }, req.body.data, function (err, profile) {
				if (err)
					return res.status(400).send('Server Error')
				return res.status(204).send(profile)
			})
		} else {
			new User(req.body.data).save(function (err, profile) {
				if (err)
					return res.status(400).send('Server Error')
				return res.status(201).send(profile)
			})
		}
	})
})

/*
* Only education
* PUT, DELETE route to come after profile page is made!
*/
router.post('/education', passport.authenticate('jwt', { session: false }), function (req, res, err) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	console.log(req.body)

	req.body.data.forEach(education => {
		new Education(education).save(function (err, edu) {
			if (err)
				return res.status(400).send('Could not save education')
			User.updateOne({ _id: req.body.user.id }, { $addToSet: { education: edu._id } }, function (err, success) {
				if (err)
					return res.status(400).send('Could not be sent')
			})
		})
	})
	return res.status(201).send('Saved')
})


/*
* Only experience
* PUT, DELETE route to come after profile page is made!
*/
router.post('/experience', passport.authenticate('jwt', { session: false }), function (req, res, err) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	req.body.data.forEach(experience => {
		new Experience(experience).save(function (err, exp) {
			if (err)
				return res.status(400).send('Could not save education')
			User.updateOne({ _id: req.body.user.id }, { $addToSet: { experience: exp._id } }, function (err, success) {
				if (err)
					return res.status(400).send('Could not be sent')
			})
		})
	})
	return res.status(201).send('Saved')
})

/*
* Only skills
* PUT route to come after profile page is made!
*/
router.post('/skills', passport.authenticate('jwt', { session: false }), function (req, res, err) {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	console.log(req.body.data.length)

	if (req.body.data.length > 0) {
		req.body.data.forEach(skill => {
			User.updateOne({ _id: req.body.user.id }, { $addToSet: { skills: skill } }, function (err, success) {
				if (err) {
					return res.status(400).send('Could not be sent')
				}
			})
		})
		return res.status(201).send('Saved')
	} else {
		return res.status(200).send('Nothing added')
	}
})

module.exports = router
