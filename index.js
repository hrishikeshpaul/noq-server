const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000
var app = express();
var logger = require('morgan');


var mongoose = require('mongoose');
var Message = require('./models/Message')
var Conversation = require('./models/Conversation')


var bodyParser = require('body-parser');
var engine = require('consolidate');
var passport = require('passport')
var cors = require('cors')
var auth = require('./routes/auth');

var job = require('./routes/job')
var profile = require('./routes/profile');
var user = require('./routes/user');
var oauth = require('./routes/oauth');
var home = require('./routes/test');
var imageupload = require('./routes/imageUpload');
var messages = require('./routes/messages')

const connectDB = require('./config/db');
connectDB();
app
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))
const server = 	app.listen(PORT, () => console.log(`Listening on ${PORT}`))
app.use(cors())
app.use(logger('dev'));
app.use('/home', home);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', auth);
app.use('/auth/linkedin', oauth)
app.use('/api/user', user);
app.use('/api/profile', profile);
app.use('/api/jobs', passport.authenticate('jwt', { session: false }), job);
app.use('/api/image/', imageupload);
app.use('/api/messages', messages)


var connectedUsers = {}
const io = require('socket.io')(server);
io.on('connection', function (socket) {
	// console.log(socket.id)

	// socket.on('disconnect', function (username) {
	// 	console.log('hreee')
	// 	if (connectedUsers[username]) {
	// 		connectedUsers[username].disconnect()
	// 		console.log('user disconnected')
	// 	}
		
	// })

	socket.on('register', function(username){
		if(!connectedUsers[username]) {
			connectedUsers[username] = socket;
			for (var i in connectedUsers) {
				connectedUsers[i].emit('ONLINE_USERS', Object.keys(connectedUsers))
			}
		}
	})


	socket.on('PVT_ONLINE', function () {
		for (var i in connectedUsers) {
				connectedUsers[i].emit('ONLINE_USERS', Object.keys(connectedUsers))
			}
	})

	socket.on('typing', function (obj) {
		if (connectedUsers.hasOwnProperty(obj.to))
			connectedUsers[obj.to].emit('TYPING', {from: obj.from, status: obj.status})
	})

	socket.on('PVT_READ', function (conversation) {
		console.log(conversation.users)
		Message.updateMany({conversation_id: conversation._id, read: false}, {$set: {read: true}}, {multi: true})
		.exec(function (err, done) {
			if (err) console.log(err)
			else {
				conversation.users.forEach(user => {
					if (connectedUsers.hasOwnProperty(user._id))
						connectedUsers[user._id].emit('PVT_READ', done)
				})
			}
		})

	})



	socket.on('SEND_MESSAGE', function(data) {
		var nameOfConversation = makeConversationName(data.from, data.to)
		data.to.push(data.from)
		for (var i in connectedUsers) {
			console.log('users: ', i)
		}
		Conversation.findOne({name: nameOfConversation}, function(err, doc){
			if (err) console.log(err)
				if (!doc) {
	    	// new conversation
	    	console.log('new doc happened')
	    	new Conversation({
	    		name: nameOfConversation,
	    		users: data.to,
	    		lastUpdatedBy: data.from
	    	}).save(function (err, conv) {
	    		if (err) console.log(err)
	    			new Message({
	    				from: data.from,
	    				to: data.to[0],
	    				conversation_id: conv._id,
	    				body: data.body
	    			}).save(function (err, msg) {
	    				if (err) console.log(err)
	    					Conversation.findOneAndUpdate({_id: msg.conversation_id}, {$push: {messages: msg._id}}, function (err, done) {
	    						if (err) console.log(err)
	    							else {
	    								Message.findOne({_id: msg._id})
	    								.populate('from')
	    								.populate('to')
	    								.exec(function (err, finalMessage) {
	    									if(connectedUsers.hasOwnProperty(data.from)) {
	    										connectedUsers[finalMessage.from._id].emit('MESSAGE', finalMessage);
	    										if(connectedUsers.hasOwnProperty(data.to)) {
	    											connectedUsers[finalMessage.to._id].emit('MESSAGE', finalMessage);
	    										}
	    									}
	    								})
	    							}
	    						})
	    			})
	    		})
	    } else {
	    	// old covnersation but sending new message from profile page
	    	console.log('old doc retrieved')
	    	new Message({
	    		from: data.from,
	    		to: data.to[0],
	    		conversation_id: data.conversation_id,
	    		body: data.body
	    	}).save(function (err, msg) {
	    		if (err) console.log(err)
	    			console.log('here: ', data.from)
	    			Conversation.findOneAndUpdate({_id: msg.conversation_id}, {$push: {messages: msg._id}, $set: {lastUpdatedBy: msg.from.toString()}, $set: {lastUpdatedAt: new Date()}}, function (err, done) {
	    				if (err) console.log(err)
	    					else {
	    						Message.findOne({_id: msg._id})
	    						.populate('from')
	    						.populate('to')
	    						.exec(function (err, finalMessage) {
	    							// console.log('finnal msg: ', finalMessage)
	    							if(connectedUsers.hasOwnProperty(finalMessage.from._id)) {
	    								connectedUsers[finalMessage.from._id].emit('MESSAGE', finalMessage);
	    								if(connectedUsers.hasOwnProperty(data.to[0])) {
	    									connectedUsers[finalMessage.to._id].emit('MESSAGE', finalMessage);
	    								}
	    							}
	    						})
	    					}
	    				})
	    	})
	    }
	  });
	});
})

function makeConversationName(from, users) {
	var name = ''
	users.sort()
	users.forEach(user => {
		name += user
	})
	name += from
	return name.split('').sort().join('');
}