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
  oauthToken: {
    type: String
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    default: null
  },
  passed_jobs: [{type: Schema.Types.ObjectId, ref: 'Job'}],
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
    type: [String],
  },
  bio: {
    type: String
  },
  experience: [{type: mongoose.Schema.Types.ObjectId, ref: 'Experience'}],
  education: [{type: mongoose.Schema.Types.ObjectId, ref: 'Education'}],
  social: {
    linkedin: {
      type: String
    },
    github: {
      type: String
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
