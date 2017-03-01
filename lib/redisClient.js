const Redis = require('ioredis');

let redisClient = new Redis();

module.exports = redisClient;