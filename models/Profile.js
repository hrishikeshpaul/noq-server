const mongoose = require('mongoose')
const ProfileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	company: {
		type: String
	},
	website: {
		type: String
	},
	location: {
		type: String
	},
	status: {
		type: String
	},
	skills: {
		type: [String],
	},
	bio: {
		type: String
	},
	experience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }],
	education: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education' }],
	honor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Honor' }],
	certication: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }],
	social: {
		youtube: {
			type: String
		},
		linkedin: {
			type: String
		}
	},
	date: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Profile', ProfileSchema)
