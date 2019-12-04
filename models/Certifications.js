var mongoose = require('mongoose')
var Schema = mongoose.Schema

const certificationSchema = new Schema({
	title: {
		type: String
	},
	issuer: {
		type: String,
	},
	issueDate: {
		type: Date
	},
	expiryDate: {
		type: Date
	},
	description: {
		type: String
	}

})

module.exports = mongoose.model('Certification', certificationSchema)
