var mongoose = require('mongoose')
var Schema = mongoose.Schema

const feedbackSchema = new Schema({
	subject: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	email: {
		type: String
	}
})

module.exports = mongoose.model('Feedback', feedbackSchema)

