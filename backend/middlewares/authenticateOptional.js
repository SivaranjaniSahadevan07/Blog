const { authenticate } = require('./auth');

const authenticateOptional = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && authHeader !== 'Bearer null') {
        // If a valid Authorization header is present, authenticate the user
        return authenticate(req, res, next);
    }

    // No valid Authorization header, proceed without authentication
    next();
};

module.exports = authenticateOptional;