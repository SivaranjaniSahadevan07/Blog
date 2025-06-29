const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    // max: 100, // Limit requests
    max: (req) => (req.user && req.user.role === 'Admin' ? 2000 : 2000), // Admins get higher limits
    message: {
        status: 429,
        error: 'Too many requests. Please try again after 15 minutes.'
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      keyGenerator: (req) => req.ip // Use IP address to identify the user
    });

module.exports = limiter;
