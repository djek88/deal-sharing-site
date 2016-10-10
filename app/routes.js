var Deal = require('../app/models/deal');
var User = require('../app/models/user');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        renderDeals(req, res);
    });

    app.get('/accountsettings', isLoggedIn, function(req, res) {
        res.render('accountsettings.ejs', {
            user : req.user
        });
    });

    app.get('/postdeal', isLoggedIn, function(req, res) {
        res.render('postdeal.ejs', {
            user : req.user
        });
    });

    app.post('/postdeal', function(req, res) {
        var deal = new Deal();
        deal.title = req.body.title;
        deal.user = req.user.local.email;
        deal.keywords = req.body.keywords;
        deal.url = req.body.url;
        deal.tags = req.body.tags;
        deal.save(function(err) {
            if (err)
                throw err;
            renderDeals(req, res);
        });
    });

    app.get('/list', function(req, res) {
        var deal = new Deal();
        console.log(JSON.stringify(req.user));
        Deal.find({}).then(function(dealList) {
        res.json( {
         
            deals : dealList
        });
            });
    });

    app.get('/upvote/:deal', function(req, res) {
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

    app.get('/downvote/:deal', function(req, res) {
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

    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/connect/local',
        failureFlash : true
    }));

    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }))

    app.get('/connect/facebook/callback', passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

    app.get('/connect/twitter/callback', passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/connect/google/callback', passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

    app.get('/unlink/local', function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/facebook', function(req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/twitter', function(req, res) {
        var user  = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });

    app.get('/unlink/google', function(req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect('/');
}

function renderDeals(req, res) {
    Deal.find({'user': req.user.local.email}).then(function(dealList) {
        res.render('profile.ejs', {
            user : req.user,
            deals : dealList
        });
    });
}