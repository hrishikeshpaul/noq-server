var JwtStrategy = require('passport-jwt').Strategy,
	ExtractJwt = require('passport-jwt').ExtractJwt;
var LinkedInStrategy = require('@sokratis/passport-linkedin-oauth2').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var url = require('../config/server_config')
var prodURL = require('../config/server_config').prod;
var devURL = require('../config/server_config').dev;

// load up the user model
var User = require('../models/User');
var settings = require('../config/settings'); // get settings file

module.exports = function (passport) {
	var opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
	opts.secretOrKey = settings.secret;
	passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
		User.findOne({ id: jwt_payload.id }, function (err, user) {
			if (err) {
				return done(err, false);
			}
			if (user) {
				console.log('user found');
				done(null, user);
			} else {
				console.log('user not found');
				done(null, false);
			}
		});
	}));

	passport.use(new LinkedInStrategy({
		clientID: '81w3oym1a80wt1',
		clientSecret: 'diLAWPATcniVV3V0',

		callbackURL: `${url.dev.server}/api/auth/linkedin/callback`,
		profileFields: ['id', 'email-address'],
	}, function (accessToken, refreshToken, profile, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			console.log(JSON.stringify(profile))
			return done(null, profile);
		});
	}));

	passport.use(new GitHubStrategy({
		clientID: 'Iv1.56db9f8a973882db',
		clientSecret: 'ca00ed7b71b8dfcdb98097e27645b3a004003439',
		callbackURL: `${devURL.server}/api/auth/github/callback`
	},
		function (accessToken, refreshToken, profile, cb) {
			console.log(JSON.stringify())
		}
	));
};
