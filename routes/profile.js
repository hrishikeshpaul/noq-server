
var mongoose = require('mongoose')
var passport = require('passport')
require('../config/passport')(passport)
var express = require('express')
var router = express.Router()
var User = require('../models/User');
var Education = require('../models/Education')
var Experience = require('../models/Experience')
var Certification = require('../models/Certifications')
var Honor = require('../models/Honors');
const { check, validationResult } = require('express-validator')
var imgur = require('imgur');

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
	// removing keys that don't have a value to prevent false updates
	req.body.data = Object.entries(req.body.data).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {})
	// if object is empty then return an error
	if (Object.entries(req.body.data).length === 0 && req.body.data.constructor === Object) {
		return res.status(400).send('All Fields Can\'t Be Empty')
	}

	User.findOne({ _id: req.body.user.id }, function (err, profile) {
		if (profile) {
			User.updateOne({ _id: req.body.user.id }, req.body.data, function (err, profile) {
				console.log(err);
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
*/
router.post('/education', passport.authenticate('jwt', { session: false }), function (req, res, err) {
	var arr = []
	req.body.data.forEach(edu => {
		arr.push(Object.entries(edu).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {}))
	})

	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return res.status(400).json({ errors: errors.array() });
	// }

	if (arr.length > 0) {
		arr.forEach(education => {
			new Education(education).save(function (err, edu) {
				if (err)
					console.log('Education can\'t be saved')
				if (edu) {
					User.updateOne({ _id: req.body.user.id }, { $addToSet: { education: edu._id } }, function (err, success) {
						if (err)
							console.log(err)
					})
				}
			})
		})
	}
	return res.status(201).send('Saved')
})

router.patch('/education/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Education.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/**
 * Does not cascade DELETE
**/

router.delete('/education/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Education.remove({ _id: req.params.id }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/*
* Only experience
* PUT, DELETE route to come after profile page is made!
*/
router.post('/experience', passport.authenticate('jwt', { session: false }), function (req, res, err) {
	var arr = []
	req.body.data.forEach(edu => {
		arr.push(Object.entries(edu).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {}))
	})

	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return res.status(400).json({ errors: errors.array() });
	// }

	if (arr.length > 0) {
		arr.forEach(experience => {
			new Experience(experience).save(function (err, exp) {
				if (err)
					console.log(err)
				else {
					User.updateOne({ _id: req.body.user.id }, { $addToSet: { experience: exp._id } }, function (err, success) {
						if (err)
							console.log('err')
					})
				}
			})
		})
	}
	return res.status(201).send('Saved')
})

router.patch('/experience/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Experience.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/**
 * Does not cascade DELETE
 **/

router.delete('/experience/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Experience.remove({ _id: req.params.id }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/*
* Only skills
* PUT route to come after profile page is made!
*/
router.post('/skills', passport.authenticate('jwt', { session: false }), function (req, res, err) {
	console.log(req.body.data)
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}

	if (req.body.data.length > 0) {
		User.updateOne({ _id: req.body.user.id }, { $set: { skills: req.body.data } }, function (err, succc) {
			if (err)
				console.log(err)
			else return res.status(201).send('Saved')
		})

	} else {
		return res.status(200).send('Nothing added')
	}
})

/*
* Only Profile picture
* Post Route to upload a profile picture
*/
// A single image
router.post('/picture', passport.authenticate('jwt', { session: false }), function (req, res, next) {

	imgur.setClientId('77457873b7895a0');
	imgur.setAPIUrl('https://api.imgur.com/3/');

	imgur.uploadBase64(req.body.image)
		.then(function (json) {
			User.findOneAndUpdate({ _id: req.body.user_id }, { $set: { profilepicture: json.data.link } }, function (err, user) {
				if (err) {
					console.log
					return res.status(400).send('Error')
				}
				else {
					return res.status(204)
				}
			})
		})
		.catch(function (err) {
			console.error(err.message);
		});
})
/*
* Only honor
*/
router.post('/honor', passport.authenticate('jwt', { session: false }), function (req, res, err) {
	var arr = []
	req.body.data.forEach(honor => {
		arr.push(Object.entries(honor).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {}))
	})
	console.log('in here');
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return res.status(400).json({ errors: errors.array() });
	// }

	if (arr.length > 0) {
		arr.forEach(honor => {
			new Honor(honor).save(function (err, hn) {
				if (err)
					console.log('Honor can\'t be saved')
				if (hn) {
					console.log('honooooooooooooooooor', hn);
					User.updateOne({ _id: req.body.user.id }, { $addToSet: { honor: hn._id } }, function (err, success) {
						if (err)
							console.log(err)
					})
				}
			})
		})
	}
	return res.status(201).send('Saved')
})


router.patch('/honor/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Honor.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/**
 * Does not cascade DELETE
**/

router.delete('/honor/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Honor.deleteOne({ _id: req.params.id }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})



/*
* Only Certification
*/
router.post('/certification', passport.authenticate('jwt', { session: false }), function (req, res, err) {
	var arr = []
	req.body.data.forEach(certificate => {
		arr.push(Object.entries(certificate).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {}))
	})

	if (arr.length > 0) {
		arr.forEach(certificate => {
			console.log(req.body.user.id);
			new Certification(certificate).save(function (err, cert) {
				if (err)
					console.log(err)
				if (cert) {

					User.findOneAndUpdate({ _id: req.body.user.id }, { $addToSet: { certification: cert._id } }, function (err, success) {
						if (err)
							console.log(err)
						if (success)
							console.log(success);
					})
				}
			})
		})
	}
	return res.status(201).send('Saved')
})


router.patch('/certification/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Certification.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})

/**
 * Does not cascade DELETE
**/

router.delete('/certification/:id', passport.authenticate('jwt', { session: false }), function (req, res, next) {
	Certification.deleteOne({ _id: req.params.id }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		else return res.status(200).send('Done')
	})
})
module.exports = router