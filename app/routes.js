const Deal = require('../app/models/deal');
const User = require('../app/models/user');

const profilePage = '/profile';
const loginPage = '/login';

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn(loginPage);
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut(profilePage);

module.exports = function(app, passport) {

	app.get('/', ensureLoggedOut, function(req, res) {
		res.render('index.ejs');
	});

	app.get(loginPage, ensureLoggedOut, function(req, res) {
		res.render('login.ejs', {message: req.flash('error')[0]});
	});

	app.post(loginPage, ensureLoggedOut, passport.authenticate('local-login', {
		successReturnToOrRedirect : profilePage,
		failureRedirect : loginPage,
		failureFlash : true
	}));

	app.get('/signup', ensureLoggedOut, function(req, res) {
		res.render('signup.ejs', {message: req.flash('error')[0]});
	});

	app.post('/signup', ensureLoggedOut, passport.authenticate('local-signup', {
		successRedirect : profilePage,
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get(profilePage, ensureLoggedIn, renderDeals);

	app.get('/accountsettings', ensureLoggedIn, function(req, res) {
		res.render('accountsettings.ejs', {user : req.user});
	});

	app.get('/postdeal', ensureLoggedIn, function(req, res) {
		res.render('postdeal.ejs', {user : req.user});
	});

	app.post('/postdeal', ensureLoggedIn, function(req, res, next) {
		var deal = new Deal();
		deal.title = req.body.title;
		deal.user = req.user.local.email;
		deal.keywords = req.body.keywords;
		deal.url = req.body.url;
		deal.tags = req.body.tags;

		deal.save(function(err) {
			if (err) return next(err);

			renderDeals(req, res, next);
		});
	});

	app.get('/list', ensureLoggedIn, function(req, res, next) {
		var deal = new Deal();
		console.log(JSON.stringify(req.user));

		Deal.find({}, function(err, deals) {
			if (err) return next(err);

			res.json({
				deals : deals
			});
		});
	});

	app.get('/upvote/:deal', ensureLoggedIn, function(req, res) {
		var deal = new Deal();
		var id = req.params.deal;
		console.log(id);

		Deal.findById(id).exec(function(error,deal) {
			if(error){
				res.status(500).json({
					error: error.toString()
				});
			}else{
				if(!deal){
					//Not Found
					res.status(404).json({
						result : 'Failure',
						error : 'Deal Not Found'
					});
				}else{
					deal.upVotes = deal.upVotes +1;
					deal.score = deal.score +1 ;
					deal.save(function(err){
						if(err){
								 res.status(500).json({
										error: err.toString()
									 });
						}else{
							 res.json({
								result : 'success',
								deal : deal
							});
						}
					});
				   
				}
			}
		});
	});

	app.get('/downvote/:deal', ensureLoggedIn, function(req, res) {
		var deal = new Deal();
		var id = req.params.deal;
		console.log(id);

		Deal.findById(id).exec(function(error,deal) {
			if(error){
				res.status(500).json({
					error: error.toString()
				});
			}else{
				if(!deal){
					//Not Found
					res.status(404).json({
						result : 'Failure',
						error : 'Deal Not Found'
					});
				}else{
					deal.downVotes = deal.downVotes +1;
					deal.score = deal.score -1 ;
					deal.save(function(err){
						if(err){
								 res.status(500).json({
										error: err.toString()
									 });
						}else{
							 res.json({
								result : 'success',
								deal : deal
							});
						}
					});
				   
				}
			}
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', {message: req.flash('loginMessage')});
	});

	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : profilePage,
		failureRedirect : '/connect/local',
		failureFlash : true
	}));


	app.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));

	app.get('/connect/facebook', passport.authorize('facebook', {scope : 'email'}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successReturnToOrRedirect : profilePage,
		failureRedirect : '/'
	}));


	app.get('/auth/google', passport.authenticate('google', {scope : ['profile', 'email']}));

	app.get('/connect/google', passport.authorize('google', {scope : ['profile', 'email']}));

	app.get('/auth/google/callback', passport.authenticate('google', {
		successReturnToOrRedirect : profilePage,
		failureRedirect : '/'
	}));


	app.get('/auth/twitter', passport.authenticate('twitter', {scope : 'email'}));

	app.get('/connect/twitter', passport.authorize('twitter', {scope : 'email'}));

	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successReturnToOrRedirect : profilePage,
		failureRedirect : '/'
	}));


	app.get('/unlink/local', function(req, res) {
		var user = req.user;
		user.local.email = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect(profilePage);
		});
	});

	app.get('/unlink/facebook', function(req, res) {
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect(profilePage);
		});
	});

	app.get('/unlink/twitter', function(req, res) {
		var user  = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
		   res.redirect(profilePage);
		});
	});

	app.get('/unlink/google', function(req, res) {
		var user = req.user;
		user.google.token = undefined;
		user.save(function(err) {
		   res.redirect(profilePage);
		});
	});
};

function renderDeals(req, res, next) {
	Deal.find({'user': req.user.local.email}, function(err, deals) {
		if (err) return next(err);

		res.render('profile.ejs', {
			user : req.user,
			deals : deals
		});
	});
}