
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	oauth: {
		type: Boolean,
		default: false
	},
	profilepicture: {
		type: String,
		default: null
	},
	oauthToken: {
		type: String
	},
	profilepicture: {
		type: String,
		default: null
	},
	password: {
		type: String,
	},
	security:{
		type: String,
		required: true
	},
	security_answer:{
		type: String,
		required: true
	},
	isVerified: {
		type: Boolean,
		default: true
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	role: {
		type: String,
		default: null
	},
	passed_jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
	passed_applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	first_time: {
		type: Boolean,
		default: true
	},
	name: {
		type: String
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
		type: Array,
	},
	bio: {
		type: String,
		default: null
	},
	experience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }],
	education: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education' }],
	honor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Honor' }],
	certification: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }],
	social: {
		linkedin: {
			type: String,
			default: null
		},
		github: {
			type: String,
			default: null
		},
	},
	date: {
		type: Date,
		default: Date.now
	}
})

UserSchema.pre('save', function (next) {
	var user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, null, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

UserSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);
