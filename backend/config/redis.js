const redis = require('redis');

const redisClient = redis.createClient({
    // host: '127.0.0.1',
    // port: 6379 // Default Redis port
    username: 'default',
    password: 'seFqsYsB5XJAk4TYyc94Yk7XayyEA67R',
    socket: {
        host: 'redis-13956.c232.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 13956,
        tls: {},
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const redisConnect = async() => {

    // Log Redis events
    try {
        await redisClient.connect();
        console.log('Connected to Redis!');
    }
    catch (err) {
        console.error('Redis connection error:', err.message);
    }
}

module.exports = {redisClient, redisConnect};