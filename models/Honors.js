var mongoose = require('mongoose')
var Schema = mongoose.Schema

const honorsSchema = new Schema({
	title: {
		type: String,
	},
	issuer: {
		type: String,
	},
	issueDate: {
		type: Date,
	},
	description: {
		type: String
	}
})

module.exports = mongoose.model('Honor', honorsSchema)
