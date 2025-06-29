const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');

// Check if a token is blacklisted
// const isTokenBlacklisted = async (token) => {
//   return new Promise((resolve, reject) => {
//     redisClient.get(token, (err, reply) => {
//       if (err) {
//         // Consider blacklisted if Redis is down for security
//          // Treat as blacklisted if Redis fails
//         return resolve(true);
//         // return reject(err);
//       }
//       resolve(reply === 'revoked'); // Check if token is blacklisted
//     });
//   });
// };

const isTokenBlacklisted = async (token) => {
  try {
    const reply = await redisClient.get(token);
    return reply === 'revoked';
  } catch (err) {
    // Consider blacklisted if Redis is down for security
    return true;
  }
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: No token provided : in authenticate" });
  }

  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(403).json({ message: 'Token is revoked or expired' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET); // Verify access token
    req.user = decoded; // Store decoded user data in the request object
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token' });
    console.log(error.message)
  }
};

// Authorization Middleware
const authorize = (roles) => (req, res, next) => {
  // console.log(req.user)
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Access Forbidden: User role not found : in authorize' });
  }

  // Check if the user's role is authorized to access the route
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access to your role is Forbidden!' });
  }
  next();
};

module.exports = { authenticate, authorize };