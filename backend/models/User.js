const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'reader'],
        default: 'reader'
    },
    isBlocked: { type: Boolean, default: false }, // New field for block/unblock functionality
    savedBlogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog' // Reference to the Blog model
        }
    ],
    profileImage: {
        type: String,
        default: '/default-profile.svg'
    },
})

// Password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = mongoose.model('User', userSchema)