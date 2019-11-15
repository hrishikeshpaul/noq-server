var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ConversationSchema = new Schema({
	name: {type: String, required: true, unique: true},
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
	lastUpdatedAt: {type: Date, default: new Date()},
	lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, 
	group: {type: Boolean, default: false}
});

module.exports = mongoose.model('Conversation', ConversationSchema);
