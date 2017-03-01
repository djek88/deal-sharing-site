const expressSession = require('express-session');
const storage = require('./session-storage');

module.exports = expressSession({
	secret: 'ilovescotchscotchyscotchscotch',
	name: 'sid',
	cookie: {
		maxAge: 1000 * 60 * 60 * 24,
	},
	store: storage,
	resave: false,
	saveUninitialized: true
});