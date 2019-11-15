var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Conversation = require('../models/Conversation')

const MessageSchema = new Schema({
	from: { type: Schema.Types.ObjectId, ref: 'User' },
	to: { type: Schema.Types.ObjectId, ref: 'User' },
	body: {
		type: String
	},
	date: {
		type: Date,
		default: new Date()
	},
	read: {
		type: Boolean,
		default: false
	},
	delivered: {
		type: Boolean,
		default: true
	},
	conversation_id: {type: Schema.Types.ObjectId, ref: 'Conversation'}

});

module.exports = mongoose.model('Message', MessageSchema);
