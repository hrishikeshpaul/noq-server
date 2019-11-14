
var mongoose = require('mongoose')
var passport = require('passport')
require('../config/passport')(passport)
var express = require('express')
var router = express.Router()
var User = require('../models/User');
var Message = require('../models/Message')
var Conversation = require('../models/Conversation')
const { check, validationResult } = require('express-validator')


// get to, from and body
// check if the users are a part of the conversation
// if not, make a new conversation and make the array of users
// if yes, then return all the messages for that conversation
router.post('/', function(req, res) {
	var nameOfConversation = makeConversationName(req.body.from, req.body.to)
	req.body.to.push(req.body.from)
	// console.log('all: ', allUsers)

	Conversation.findOne({name: nameOfConversation}, function(err, doc){
		if (err) console.log(err)
			if (!doc) {
    	// new conversation
    	new Conversation({
    		name: nameOfConversation,
    		users: req.body.to,
    		lastUpdatedBy: req.body.from
    	}).save(function (err, conv) {
    		if (err) console.log(err)
    			new Message({
    				from: req.body.from,
    				to: req.body.to[0],
    				conversation_id: conv._id,
    				body: req.body.body
    			}).save(function (err, msg) {
    				if (err) console.log(err)
    					Conversation.findOneAndUpdate({_id: msg.conversation_id}, {$push: {messages: msg._id}}, function (err, done) {
    						if (err) console.log(err)
    							return res.status(200).send('done')
    					})
    			})
    		})
    } else {
    	// old covnersation but sending new message from profile page
    	new Message({
    		from: req.body.from,
    		to: req.body.to[0],
    		conversation_id: doc._id,
    		body: req.body.body
    	}).save(function (err, msg) {
    		if (err) console.log(err)
    			Conversation.findOneAndUpdate({_id: msg.conversation_id}, {$push: {messages: msg._id}}, function (err, done) {
    				if (err) console.log(err)
    					return res.status(200).send('done')
    			})
    	})
    }
  });
})

router.get('/conversation/:id', function (req, res) {
	Conversation.find({users: {$in: [req.params.id]}})
	.populate({
    path : 'messages',
    populate : [{path: 'from'}, {path: 'to'}]
  })
	.populate('users')
	.exec(function (err, conversation) {
		if (err) console.log(err)
		return res.status(200).send(conversation)
	})
})

router.get('/:id', function (req, res) {
	Message.find({to: req.params.id})
	.populate('to')
	.populate('from')
	.exec(function (err, msgs) {
		if (err) cosnole.log(err)
			return res.send(msgs)
	})
})

module.exports = router

function makeConversationName(from, users) {
	var name = ''
	users.forEach(user => {
		name += user
	})
	name += from
	return name.split('').sort().join('');
}