const User = require('../models/User');
const Blog = require('../models/Blog');
const bcrypt = require('bcryptjs');

// Get All Users
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        const query = {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        };

        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Update User Role
const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Role is required' });
    }

    const validRoles = ['admin', 'editor', 'reader'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role; // Update user role
        await user.save();

        res.status(200).json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a User
const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne(); // Delete user
        // await user.remove();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a New User
const createUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create the new user
        const newUser = new User({ username, email, password, role });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const blockUnblockUser = async (req, res) => {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBlocked = isBlocked;
        await user.save();

        res.status(200).json({
            message: `User has been ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to block/unblock user' });
    }
};

const saveBlog = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming `req.user` contains the authenticated user's info
        const { blogId } = req.body;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is a reader
        if (user.role !== 'reader') {
            return res.status(403).json({ message: 'Only readers can save blogs' });
        }

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the blog is already saved
        if (user.savedBlogs.includes(blogId)) {
            return res.status(400).json({ message: 'Blog is already saved' });
        }

        // Add the blog to the user's savedBlogs
        user.savedBlogs.push(blogId);
        await user.save();
        // console.log(user.savedBlogs)

        res.status(200).json({ message: 'Blog saved successfully', savedBlogs: user.savedBlogs });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSavedBlogs = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('savedBlogs'); // Populate savedBlogs with blog details
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ savedBlogs: user.savedBlogs });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const removeSavedBlogs = async (req, res) => {
    const { blogId } = req.body;

    if (!blogId) {
        return res.status(400).json({ message: 'Blog ID is required' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the blog from the savedBlogs array
        user.savedBlogs = user.savedBlogs.filter((savedBlog) => savedBlog.toString() !== blogId);

        await user.save();

        res.status(200).json({ message: 'Blog removed from saved blogs', savedBlogs: user.savedBlogs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const postedBlogs = await Blog.countDocuments({ author: req.user.id });
        res.status(200).json({ user, postedBlogs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // Construct the public URL for the uploaded file
        const profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-pictures/${req.user.id}/${req.file.filename}`;
        // console.log(profileImageUrl)
        // Save the public URL in the database
        user.profileImage = profileImageUrl;
        await user.save();

        res.status(200).json({ message: 'Profile picture updated successfully', profileImage: user.profileImage });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

// Update username
const updateUsername = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.username = req.body.username;
        await user.save();
        res.status(200).json({ message: 'Username updated successfully', username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update username' });
    }
};

// Update email
const updateEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.email = req.body.email;
        await user.save();
        res.status(200).json({ message: 'Email updated successfully', email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update email' });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        user.password = req.body.newPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password' });
    }
};


module.exports = {
    getUserProfile,
    updateProfilePicture,
    updateUsername,
    updateEmail,
    updatePassword,
    createUser,
    getAllUsers,
    updateUserRole,
    deleteUser,
    blockUnblockUser,
    saveBlog,
    getSavedBlogs,
    removeSavedBlogs
};
