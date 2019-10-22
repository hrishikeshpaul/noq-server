var mongoose = require('mongoose');
var passport = require('passport');
var settings = require('../config/settings');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Job = require("../models/Job");
var User = require("../models/User");

router.get('/', function (req, res, next) {
	var jobsToFilter = []
	User.findOne({ _id: req.query.user })
		.populate('passed_jobs')
		.exec(function (err, user) {
			user.passed_jobs.forEach(job => {
				jobsToFilter.push(job._id.toString())
			})
			Job.find({}).lean().exec(function (err, jobs) {
				if (err)
					return res.status(400).send('Error')
				var allJobs = jobs
				allJobs.forEach(job => {
					job._id = job._id.toString()
					job.applicants.forEach(i => {
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
})

router.post('/', function (req, res, next) {
	var newJob = Job(req.body)
	newJob.save(function (err, job) {
		if (err)
			console.log(err)
		res.send(job)
	})
})

router.patch('/reject', function (req, res, next) {
	User.updateOne({ _id: req.body.user }, { $addToSet: { passed_jobs: mongoose.Types.ObjectId(req.body.job) } }, function (err, success) {
		if (err)
			return res.status(400).send('Error')
		return res.status(204).send('Updated')
	})

	return res.status(204).send('Updated')

})

router.patch('/accept', function (req, res, next) {
	Job.updateOne({ _id: req.body.job }, { $addToSet: { applicants: mongoose.Types.ObjectId(req.body.user) } }, function (err, success) {
		if (err)
			return res.status(400).send('Error')
		return res.status(204).send('Updated')
	})

})

module.exports = router
