const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('./redisClient');

module.exports = new RedisStore({
	client: redisClient,
	db: 0
});