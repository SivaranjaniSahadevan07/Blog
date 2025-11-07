const redis = require('redis');

const redisClient = redis.createClient({
    // host: '127.0.0.1',
    // port: 6379 // Default Redis port
    username: 'default',
    password: 'sRALrOaDUy5yBqDHVDzMLwXnSh7Klmod',
    socket: {
        host: 'redis-17554.c277.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17554,
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