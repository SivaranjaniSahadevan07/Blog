const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

require('dotenv').config()
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || "localhost"
const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https' : 'http';

const connectDB = require('./config/db')
const rateLimiter = require('./middlewares/rateLimiter')
const { redisConnect } = require('./config/redis');

const authRoutes = require('./routes/authRoutes')
const blogRoutes = require('./routes/blogRoutes')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')
const categoryRoutes = require('./routes/categoryRoutes')

const startServer = async () => {
    await connectDB()
    await redisConnect()

    // middlewares
    // Serve static files from the uploads directory
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use(cors({ origin: process.env.REACT_APP_URL, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(helmet())
    // Apply rate limiter to all routes
    app.use(rateLimiter)


    // routes
    app.use('/api/auth', authRoutes);
    // Alternatively, apply to specific routes (e.g., authentication)
    // app.use('/api/auth', rateLimiter);
    app.use('/api/blogs', blogRoutes);
    app.use('/api/users', userRoutes)
    app.use('/api/comments', commentRoutes)
    app.use('/api/categories', categoryRoutes)

    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ message: err.message || 'Server Error' });
    });

    app.use('*', (req, res) => {
        res.status(404).send('Endpoint not found');
    });

    app.listen(PORT, () => {
        const serverURL = `${PROTOCOL}://${HOST}:${PORT}`
        console.log("Server running at " + serverURL)
    })
}

startServer()