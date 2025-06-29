const authenticateRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken; // Assuming it's stored in an HTTP-only cookie
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized: No refresh token provided' });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
        req.user = decoded; // Add the decoded user info to the request
        next();
    });
};
