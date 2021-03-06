var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../app/models/user');
var configAuth = require('./auth');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, done);
	});

	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		setImmediate(function() {
			User.findOne({ 'local.email' :  email }, function(err, user) {
				if (err) return done(err);
				if (!user)
					return done(null, false, {message: 'User not found.'});
				if (!user.validPassword(password))
					return done(null, false, {message: 'Oops! Wrong password.'});

				return done(null, user);
			});
		});
	}));

	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		setImmediate(function() {
			User.findOne({'local.email': email}, function(err, existingUser) {
				if (err) return done(err);
				if (existingUser)
					return done(null, false, {message: 'That email is already taken.'});

				var newUser = new User();
				newUser.local.email = email;
				newUser.local.password = newUser.generateHash(password);
				newUser.save(done);
			});
		});
	}));

	passport.use(new FacebookStrategy({
		clientID : configAuth.facebookAuth.clientID,
		clientSecret : configAuth.facebookAuth.clientSecret,
		callbackURL : configAuth.facebookAuth.callbackURL,
		passReqToCallback : true
	},
	function(req, token, refreshToken, profile, done) {
		setImmediate(function() {
			if (!req.user) {
				User.findOne({'facebook.id': profile.id}, function(err, user) {
					if (err) return done(err);

					if (user) {
						if (!user.facebook.token) {
							user.facebook.token = token;
							user.facebook.name  = profile.displayName;
							//user.facebook.email = profile.emails[0].value;

							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						var newUser = new User();
						newUser.facebook.id = profile.id;
						newUser.facebook.token = token;
						newUser.facebook.name = profile.displayName;
						newUser.save(done);
					}
				});
			} else {
				var user = req.user;
				user.facebook.id = profile.id;
				user.facebook.token = token;
				user.facebook.name = profile.displayName;
				//user.facebook.email = profile.emails[0].value;

				user.save(function(err) {
					if (err)
						throw err;
					return done(null, user);
				});
			}
		});
	}));

	passport.use(new GoogleStrategy({
		clientID : configAuth.googleAuth.clientID,
		clientSecret : configAuth.googleAuth.clientSecret,
		callbackURL : configAuth.googleAuth.callbackURL,
		passReqToCallback : true
	},
	function(req, token, refreshToken, profile, done) {
		setImmediate(function() {
			if (!req.user) {
				User.findOne({ 'google.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);
					if (user) {
						if (!user.google.token) {
							user.google.token = token;
							user.google.name  = profile.displayName;
							user.google.email = profile.emails[0].value;

							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						var newUser = new User();
						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.google.name = profile.displayName;
						newUser.google.email = profile.emails[0].value;

						newUser.save(function(err) {
							if (err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			} else {
				var user = req.user;
				user.google.id = profile.id;
				user.google.token = token;
				user.google.name = profile.displayName;
				user.google.email = profile.emails[0].value;

				user.save(function(err) {
					if (err)
						throw err;
					return done(null, user);
				});
			}
		});
	}));

	passport.use(new TwitterStrategy({
		consumerKey : configAuth.twitterAuth.consumerKey,
		consumerSecret : configAuth.twitterAuth.consumerSecret,
		callbackURL : configAuth.twitterAuth.callbackURL,
		passReqToCallback : true
	},
	function(req, token, tokenSecret, profile, done) {
		setImmediate(function() {
			if (!req.user) {
				User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
					if (err)
						return done(err);
					if (user) {
						if (!user.twitter.token) {
							user.twitter.token = token;
							user.twitter.username = profile.username;
							user.twitter.displayName = profile.displayName;

							user.save(function(err) {
								if (err)
									throw err;
								return done(null, user);
							});
						}
						return done(null, user);
					} else {
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.username = profile.username;
						newUser.twitter.displayName = profile.displayName;

						newUser.save(function(err) {
							if (err)
								throw err;
							return done(null, newUser);
						});
					}
				});
			} else {
				var user = req.user;
				user.twitter.id = profile.id;
				user.twitter.token = token;
				user.twitter.username = profile.username;
				user.twitter.displayName = profile.displayName;

				user.save(function(err) {
					if (err)
						throw err;
					return done(null, user);
				});
			}
		});
	}));
};