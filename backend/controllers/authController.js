const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { redisClient } = require('../config/redis');

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' } // Access token expires in 15 minutes
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );
};

// Add token to blacklist
// const blacklistToken = async (token, expirationTimeInSeconds) => {
//   redisClient.set(token, 'revoked', 'EX', expirationTimeInSeconds, (err, reply) => {
//     if (err) {
//       console.error('Error adding token to blacklist:', err);
//       return res.status(500).json({ message: 'Logout failed' });
//     } else {
//       console.log(`Token added to blacklist: ${token}`);
//       res.status(200).json({ message: 'Logged out successfully' });
//     }
//   });
// };

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  // Check if a user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already registered with this email' });
  }

  // Check if this is the first user to be registered
  const isFirstUser = (await User.countDocuments()) === 0; // Count all users in the database
  const role = isFirstUser ? 'admin' : "reader";

  try {
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User Registered Successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User Not Found' });

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
    }

    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send tokens (refresh token in HTTP-only cookie for security)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents access by JavaScript
      secure: process.env.NODE_ENV === 'production', // Sends the cookie only over HTTPS
      // sameSite: 'Strict', // Protects against CSRF
      sameSite: 'None', // allow cross-site cookie
      // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({ accessToken, user: await User.findById(user._id).select("-password") }); // Send access token in the response
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle server errors
  }
};

// Refresh Token Function
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Check if refresh token exists
  if (!refreshToken) return res.status(401).send('Refresh token not provided');

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    // Generate new access token
    const accessToken = generateAccessToken(user);
    res.status(201).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout Function
// exports.logout = async (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     // Decode token to get expiry
//     const decoded = jwt.decode(token);
//     if (!decoded || !decoded.exp) {
//       return res.status(400).json({ message: 'Invalid token' });
//     }

//     // Get the token's expiration time from the payload
//     // const expirationTimeInSeconds = Math.floor(decoded.exp - Date.now() / 1000);

//     // Calculate seconds until token expiry
//     const now = Math.floor(Date.now() / 1000);
//     const expiresIn = decoded.exp - now;
//     if (expiresIn <= 0) {
//       return res.status(400).json({ message: 'Token already expired' });
//     }

//     // Blacklist the token
//     // await blacklistToken(token, expirationTimeInSeconds);

//     // Store token in Redis with expiry
//     // redisClient.set(token, 'revoked', 'EX', expiresIn, (err) => {
//     //   if (err) {
//     //     console.error('Error adding token to blacklist:', err);
//     //     return res.status(500).json({ message: 'Logout failed' });
//     //   }
//     //   console.log(`Token added to blacklist: ${token}`);
//     //   res.status(200).clearCookie("refreshToken").json({ message: 'Logged out successfully' });
//     // })

//     // Use Promise-based Redis API (no callback!)
//     await redisClient.set(token, 'revoked', { EX: expiresIn });

//     res.status(200).clearCookie("refreshToken").json({ message: 'Logged out successfully' });
//     // res.status(200).clearCookie("refreshToken").json({ message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Error during logout:', error.message);
//     res.status(500).json({ message: 'Failed to log out' });
//   }
// };

exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    if (expiresIn <= 0) {
      return res.status(400).json({ message: 'Token already expired' });
    }

    // Use Promise-based Redis API (no callback!)
    await redisClient.set(token, 'revoked', { EX: expiresIn });

    res.status(200).clearCookie("refreshToken").json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};