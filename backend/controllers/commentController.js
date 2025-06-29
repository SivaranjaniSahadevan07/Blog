const path = require('path');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const User = require('../models/User');

const fs = require('fs');

// Log comment deletion details
const logCommentDeletion = (deletedBy, commentAuthor, commentContent, commentId, reason) => {
    const logEntry = `${new Date().toISOString()} | Deleted By: ${deletedBy.id} (${deletedBy.name}) | Comment Author: ${commentAuthor.id} (${commentAuthor.name}) | Comment ID: ${commentId} | Comment Content: "${commentContent}" | Reason: ${reason}\n`;
    const logFilePath = path.join(__dirname, '../deletion_logs.txt');
    fs.appendFileSync(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to log comment deletion:', err);
        }
    });
};

// Create a Comment
const addComment = async (req, res) => {
    const { content } = req.body;
    const { blogId } = req.params;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        // Ensure only one comment per Reader per blog
        const existingComment = await Comment.findOne({ blog: blogId, author: req.user.id });
        if (existingComment) {
            return res.status(400).json({ message: 'You can only comment once on this blog post' });
        }

        // Create and save the new comment
        const comment = new Comment({
            content,
            author: req.user.id,
            blog: blogId
        });
        // console.log(comment)
        await comment.save();

        // Populate the author field with the user's details
        const populatedComment = await Comment.findById(comment._id).populate('author', 'username');

        res.status(201).json({ comment: populatedComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Hard delete a comment
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const { reason } = req.body; // Reason for deletion
    const deletedById = req.user.id; // ID of the user performing the deletion

    // console.log('Request Body:', req.body);
    // console.log('Request User:', req.user);
    // console.log(commentId, reason, deletedById);

    try {
        // Find the comment to delete
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Find the blog associated with the comment
        const blog = await Blog.findById(comment.blog);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Authorization check (comment author, blog author, or admin)
        if (
            (comment.author && comment.author._id.toString() === deletedById.toString()) || // Comment author
            req.user.role === 'admin' || // Admin
            (req.user.role === 'editor' && blog.author && blog.author._id.toString() === deletedById.toString()) // Blog author
        ) {
            // Find the comment author
            const commentAuthor = await User.findById(comment.author._id);
            const deletedBy = await User.findById(deletedById);


            // Log the deletion details
            if (req.user.role !== 'reader') {
                logCommentDeletion(
                    { id: deletedBy._id, name: deletedBy.username },
                    { id: commentAuthor._id, name: commentAuthor.username },
                    comment.content,
                    comment._id,
                    reason
                );
            }

            const commentDeleteReason = {
                deletedBy: deletedBy.username,
                reason: reason,
            }

            // Perform a hard delete
            await Comment.findByIdAndDelete(commentId);

            return res.status(200).json({ message: 'Comment deleted successfully', commentDeleteReason });
        }

        res.status(403).json({ message: 'You are not authorized to delete this comment' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
};

const replyToComment = async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    if (!content) {
        return res.status(400).json({ message: 'Reply content is required' });
    }

    try {
        // Ensure the parent comment exists
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Parent comment not found' });
        }

        // Create the reply
        const reply = new Comment({
            content,
            author: req.user.id,
            blog: parentComment.blog,
            parentComment: commentId
        });
        await reply.save();

        // Populate the author field with the user's details
        const populatedReply = await Comment.findById(reply._id).populate('author', 'username email');

        res.status(201).json({ message: 'Reply added successfully', reply: populatedReply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required to edit comment' });
    }

    try {
        const comment = await Comment.findById(commentId);

        // Check if comment exists and belongs to the user
        if (!comment || comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own comment' });
        }

        comment.content = content;
        comment.updatedAt = Date.now();
        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Like/Dislike a Comment
const likeDislikeComment = async (req, res) => {
    const { commentId } = req.params;
    const { action } = req.body; // Action: "like" or "dislike"

    if (!['like', 'dislike'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike".' });
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Prevent liking/disliking your own comment
        if (comment.author.toString() === req.user.id) {
            return res.status(403).json({ message: 'You cannot like or dislike your own comment.' });
        }

        // Handle like/dislike action
        if (action === 'like') {
            comment.dislikes = comment.dislikes.filter(userId => userId.toString() !== req.user.id); // Remove from dislikes
            if (!comment.likes.includes(req.user.id)) {
                comment.likes.push(req.user.id);
            }
        } else if (action === 'dislike') {
            comment.likes = comment.likes.filter(userId => userId.toString() !== req.user.id); // Remove from likes
            if (!comment.dislikes.includes(req.user.id)) {
                comment.dislikes.push(req.user.id);
            }
        }

        await comment.save();

        res.status(200).json({ message: `You have successfully ${action}d the comment.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommentLikes = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Find the comment by ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Return the number of likes
        res.status(200).json({ likes: comment.likes.length });
    } catch (error) {
        console.error('Error fetching comment likes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCommentDislikes = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Find the comment by ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Return the number of dislikes
        res.status(200).json({ dislikes: comment.dislikes.length });
    } catch (error) {
        console.error('Error fetching comment dislikes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addComment, deleteComment, replyToComment, editComment, likeDislikeComment, getCommentLikes, getCommentDislikes };
