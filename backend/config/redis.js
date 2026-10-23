const redis = require('redis');

const redisClient = redis.createClient({
    // host: '127.0.0.1',
    // port: 6379 // Default Redis port
     username: 'default',
    password: 'pSIe0dxD9fjCgNShnHkfOyX8Q9W93CN1',
    socket: {
        host: 'redis-11696.c10.us-east-1-4.ec2.cloud.redislabs.com',
        port: 11696
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
