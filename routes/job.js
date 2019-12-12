var mongoose = require('mongoose');
var passport = require('passport');
var settings = require('../config/settings');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Job = require("../models/Job");
var User = require('../models/User');

router.get('/', function (req, res, next) {
	if (req.query.role === 'student') {
		var jobsToFilter = []
		User.findOne({ _id: req.query.user })
		.populate('passed_jobs')
		.exec(function (err, user) {
				// passed jobs shouldn't appear. so getting all the IDs of the jobs that user has passed
				user.passed_jobs.forEach(job => {
					jobsToFilter.push(job._id.toString())
				})
				Job.find({}).populate('employer').lean().exec(function (err, jobs) {
					if (err)
						return res.status(400).send('Error')
					var allJobs = jobs
					allJobs.forEach(job => {
						job._id = job._id.toString()
						// if user has applied to a job, the user should not see it
						job.applicants.forEach(i => {
							if (i.toString() === req.query.user) {
								jobsToFilter.push(job._id)
							}
						})
						// if the user has been confirmed, he should not see it
						job.confirmed_users.forEach(i => {
							if (i.toString() === req.query.user) {
								jobsToFilter.push(job._id)
							}
						})
						// if the user has been rejected by the company then he shall not see it
						job.rejected_users.forEach(i => {
							if (i.toString() === req.query.user) {
								jobsToFilter.push(job._id)
							}
						})
					})
					jobsToFilter.forEach(rem => {
						allJobs.filter(x => x._id === rem).forEach(x => allJobs.splice(allJobs.indexOf(x), 1));
					})
					return res.status(200).send(allJobs)
				})
			})
	} else if (req.query.role === 'employer') {
		// get back only those applicants who have applied!!!!!
		var applicants = []
		var passedApplicants = []

		Job.find({ employer: req.query.user })
		.populate('applicants')
		.exec(function (err, jobs) {
			if (err)
				console.log(err)
			jobs.forEach(job => {
				job.applicants.forEach(applicant => {
					applicants.push({
						applicant: applicant._id.toString(),
						job: job,
						complete: false
					})
				})
			})

			console.log('hi')
			ctr = 0
			var usersToReturn = []
			applicants.forEach(applicant => {
				User.findOne({_id: applicant.applicant})
				.populate('experience')
				.populate('education')
				.exec(function (err, user) {
					if(err) console.log(err)
					else {
						user._doc['job'] = applicant.job
						usersToReturn.push(user)
						ctr++
						if (ctr == applicants.length) {
					return res.status(200).send(usersToReturn)
				}
					}
				})

				
			})

			
			// User.find({ role: 'student' })
			// .populate('experience')
			// .populate('education')
			// .exec(function (err, users) {
			// 	if (err)
			// 		console.log(err)
			// 	var ctr = 0
			// 	var usersToReturn = []
			// 	users.forEach(user => {
			// 		ctr += 1
			// 		applicants.forEach(applicant => {
			// 			if (user._id.toString() === applicant.applicant && applicant.complete === false) {
			// 				user._doc['job'] = applicant.job
			// 				applicant.complete = true
			// 				usersToReturn.push(user)
			// 				return 
			// 			}
			// 		})
			// 		if (ctr == users.length) {
			// 			return res.status(200).send(usersToReturn)
			// 		}
			// 	})
			// })
		})
	}
})

router.post('/', function (req, res, next) {
	req.body.location = req.body.location
	var newJob = Job(req.body)

	newJob.save(function (err, job) {
		if (err) {
			console.log(err)
			return res.status(400).send('Error in posting job')
		}
			
		return res.status(204).send(job)
			
	
	})
})

router.delete('/:id', function (req, res, next) {
	Job.remove({ _id: req.params.id }, function (err, succ) {
		if (err)
			return res.status(400).send('Could not delete')
		return res.status(200).send('deleted')
	})
})


router.patch('/reject', function (req, res, next) {
	if (req.body.role === 'student') {
		User.updateOne({ _id: req.body.user }, { $addToSet: { passed_jobs: mongoose.Types.ObjectId(req.body.job) } }, function (err, success) {
			if (err)
				return res.status(400).send('Error')
			return res.status(204).send('Updated')
		})
	} else if (req.body.role === 'employer') {
		Job.findOneAndUpdate({ _id: req.body.job }, { $pullAll: { applicants: [req.body.userToReject] }, $addToSet: { rejected_users: req.body.userToReject } }, function (err, job) {
			if (err)
				return res.status(400).send('Error')
			return res.status(204).send('Updated')
		})
	}
})

router.patch('/accept', function (req, res, next) {
	if (req.body.role === 'student') {
		var UpdateDict = {}
		console.log(req.body.job)
		
		Job.updateOne({ _id: req.body.job._id }, { $addToSet: { applicants: mongoose.Types.ObjectId(req.body.user) } }, function (err, success) {
			if (err)
				return res.status(400).send('Error')
			else {
				var counter = 0
				req.body.job.skills.forEach(skill => {
					counter ++
					User.findOneAndUpdate({_id: req.body.user, 'skills.name': skill.name}, {$inc: {[`skills.$.points`]: 1}}, function (err, donne) {
						if (err) console.log(err)
							console.log('done')
					})
				})
			}
			if (counter === req.body.job.skills.length)
				return res.status(204).send('Updated')
		})
	} else if (req.body.role === 'employer') {
		console.log(req.body.job)
		Job.findOneAndUpdate({ _id: req.body.job }, { $pullAll: { applicants: [req.body.userToAccept] }, $addToSet: { confirmed_users: req.body.userToAccept } }, function (err, job) {
			if (err)
				return res.status(400).send('Error')
			return res.status(204).send('Updated')
		})
	}
})

router.patch('/edit/:id', function (req, res, next) {
	Job.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, function (err, succ) {
		if (err)
			return res.status(400).send('Error')
		return res.status(200).send('Done')
	})
})

router.patch('/rejectconfirmedapplicant', function (req, res, next) {
	Job.findOneAndUpdate({ _id: req.body.job }, { $pull: { confirmed_users: mongoose.Types.ObjectId(req.body.user) }, $addToSet: { rejected_users: mongoose.Types.ObjectId(req.body.user) } }, function (err, succ) {
		if (err)
			console.log(err)
		else
			return res.status(200).send('Updated')
	})
})

router.get('/recommendation/:id', function (req, res, next) {
	User.findOne({_id: req.params.id})
	.exec(function (err, user) {
		if (err) console.log(err)
		else {
			user.skills.sort((a, b) => parseFloat(b.points) - parseFloat(a.points));
			res.status(200).send(user.skills[0])
		}
	})
})

module.exports = router
