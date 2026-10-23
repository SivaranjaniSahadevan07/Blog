const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const redisConnect = async () => {
    try {
        await redisClient.connect();
        console.info('Redis connection established');
    }
    catch (err) {
        console.error('Redis connection error:', err.message);
    }
}

module.exports = {redisClient, redisConnect};
