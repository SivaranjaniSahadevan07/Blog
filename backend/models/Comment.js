const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User who made the comment
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true }, // Reference to the blog post the comment belongs to
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isDeleted: { type: Boolean, default: false }, // Flag for deletion
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked the comment
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Users who disliked the comment
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);