const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // Field to store the image URL
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // Reference Category IDs
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who liked the post
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Users who disliked the post
//   createdAt: { type: Date, default: Date.now },
}, {timestamps: true});

module.exports = mongoose.model('Blog', blogSchema);
