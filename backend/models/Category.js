const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }, // Optional: For additional info about the category
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }] // Array of blog IDs
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
