var mongoose = require('mongoose')
var Schema = mongoose.Schema

const honorsSchema = new Schema({
	title: {
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
	description: {
		type: String
	}

})

module.exports = mongoose.model('Honor', honorsSchema)
