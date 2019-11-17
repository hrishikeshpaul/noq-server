var mongoose = require('mongoose')
var Schema = mongoose.Schema

const certificationSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	issuer: {
		type: String,
		required: true
	},
	issueDate: {
		type: Date,
		required: true
	},
	expiryDate: {
		type: Date,
		required: true
	},
	description: {
		type: String
	}

})

module.exports = mongoose.model('Certification', certificationSchema)
