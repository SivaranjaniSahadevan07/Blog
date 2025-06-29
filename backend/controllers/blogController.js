const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const path = require('path');
const fs = require('fs'); // Import the fs module

const getAllBlogs = async (req, res) => {
  try {
    const { page, limit } = req.query; // Default to page 1 and limit 10 if not provided

    // Convert page and limit to integers
    const pageNumber = parseInt(page) || 1; // Default page to 1 if not provided
    const limitNumber = parseInt(limit) || 10; // Default limit to 10 if not provided

    // console.log(limitNumber);

    // Fetch blogs with pagination
    const blogs = await Blog.find()
      .populate('author', 'username') // Replace 'author' ObjectId with user details
      .skip((pageNumber - 1) * limitNumber) // Skip blogs for previous pages
      .limit(limitNumber) // Limit the number of blogs per page
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Get the total count of blogs
    const totalBlogs = await Blog.countDocuments();

    // console.log(blogs)

    res.status(200).json({
      totalBlogs,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBlogs / limitNumber),
      blogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// const createNewBlog = async (req, res) => {
//   const { title, content, categories } = req.body;

//   try {
//     const newBlog = new Blog({
//       title,
//       content,
//       categories, // Pass an array of category IDs
//       author: req.user.id,
//     });
//     await newBlog.save();
//     res.status(201).json(newBlog);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

const createNewBlog = async (req, res) => {
  let { title, content, categories } = req.body;
  // console.log(categories)

  // Parse categories if it's a JSON string
  if (typeof categories === 'string') {
    try {
      categories = JSON.parse(categories);
    } catch (e) {
      // If not JSON, try to split by comma
      categories = categories.split(',').map(id => id.trim());
      // If parsing fails, send a bad request response
      // return res.status(400).json({ error: 'Invalid categories format' });
    }
  }

  // Ensure categories is an array
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Categories must be an array' });
  }

  // console.log("Categories:", categories);

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Step 1: Create the blog without the image path
    const newBlog = new Blog({
      title,
      content,
      categories, // Parse categories if sent as JSON
      author: req.user.id,
    });

    await newBlog.save();

    // Step 2: Create a folder for the blog ID
    const blogDir = path.join(__dirname, `../uploads/blog-images/${newBlog._id}`);
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }

    // Step 3: Move the uploaded file to the blog ID folder
    const oldPath = path.join(__dirname, `../uploads/blog-images/${req.file.filename}`);
    const newPath = path.join(blogDir, req.file.filename);
    fs.renameSync(oldPath, newPath);

    // Step 4: Update the blog with the correct image path
    newBlog.image = `${req.protocol}://${req.get('host')}/uploads/blog-images/${newBlog._id}/${req.file.filename}`;
    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const updateBlog = async (req, res) => {
//     const id = req.params.blogId;
//     const { title, content } = req.body;
//     try {
//         const updatedBlog = await Blog.findByIdAndUpdate(id, { title, content }, { new: true });
//         res.status(201).json(updatedBlog);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


const deleteBlog = async (req, res) => {
  const id = req.params.blogId;
  try {
    await Blog.findByIdAndDelete(id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getSingleBlog = async (req, res) => {
  const { blogId } = req.params

  try {
    const blog = await Blog.findById(blogId).populate("author", "username").populate('categories', 'name');
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    // console.log(blog)
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blog by id' });
  }
}

// const getBlogComments = async (req, res) => {
//   try {
//     const { blogId } = req.params;

//     // Check if the blog exists
//     const blog = await Blog.findById(blogId);
//     if (!blog) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }

//     // Fetch all comments for the blog
//     const comments = await Comment.find({ blog: blogId }).sort({ createdAt: -1 }).populate('author', 'username'); // Sort by newest first

//     res.status(200).json({ comments });
//   } catch (error) {
//     console.error('Error fetching blog comments:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const getBlogComments = async (req, res) => {
//   const { blogId } = req.params;
//   // console.log("User:", req.user);

//   try {
//     // Fetch all comments for the blog
//     let comments = await Comment.find({ blog: blogId }).sort({ createdAt: -1 }).populate('author', 'username');

//     // If the user is not authenticated, return all comments as is
//     if (!req.user || !req.user.id) {
//       // console.log("no token comments")
//       return res.status(200).json(comments);
//     }

//     // Separate the logged-in user's comment from the rest
//     const userComments = [];
//     const otherComments = [];

//     // if (!req.user || !req.user.id) { }
//     comments.forEach(comment => {
//       if (comment.author._id.toString() === req.user.id) {
//         userComments.push(comment); // Logged-in user's comment
//       } else {
//         otherComments.push(comment); // Other users' comments
//       }
//     });

//     // Combine the logged-in user's comment(s) with the rest
//     comments = [...userComments, ...otherComments];

//     res.status(200).json(comments);
//   } catch (error) {
//     console.error("Error in getBlogComments:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getBlogComments = async (req, res) => {
  const { blogId } = req.params;
  // console.log("User:", req.user);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Count total comments for pagination
  const totalComments = await Comment.countDocuments({ blog: blogId });

  try {
    // Fetch all comments for the blog
    let comments = await Comment.find({ blog: blogId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username');

    // If the user is not authenticated, return all comments as is
    if (!req.user || !req.user.id) {
      // console.log("no token comments")
      return res.status(200).json(comments);
    }

    // Separate the logged-in user's comment from the rest
    const userComments = [];
    const otherComments = [];

    // if (!req.user || !req.user.id) { }
    comments.forEach(comment => {
      if (comment.author._id.toString() === req.user.id) {
        userComments.push(comment); // Logged-in user's comment
      } else {
        otherComments.push(comment); // Other users' comments
      }
    });

    // Combine the logged-in user's comment(s) with the rest
    comments = [...userComments, ...otherComments];

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getBlogComments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const getBlogComments = async (req, res) => {
//   try {
//     const { blogId } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;

//     // Check if the blog exists
//     const blog = await Blog.findById(blogId);
//     if (!blog) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }

//     // Count total comments for pagination
//     const totalComments = await Comment.countDocuments({ blog: blogId });

//     // Fetch paginated comments
//     const comments = await Comment.find({ blog: blogId })
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .populate('author', 'username');

//     res.status(200).json({
//       comments,
//       currentPage: page,
//       totalPages: Math.ceil(totalComments / limit),
//       totalComments,
//     });
//   } catch (error) {
//     console.error('Error fetching blog comments:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


const getblogLikes = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user's info

    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if the user has already liked the blog
    if (blog.likes.includes(userId)) {
      // If already liked, remove the like
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: 'Like removed', likes: blog.likes.length });
    }

    // Add the user's like
    blog.likes.push(userId);
    await blog.save();

    res.status(200).json({ message: 'Blog liked', likes: blog.likes.length });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getblogDislikes = async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user's info

    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if the user has already disliked the blog
    if (blog.dislikes.includes(userId)) {
      // If already disliked, remove the dislike
      blog.dislikes = blog.dislikes.filter((id) => id.toString() !== userId);
      await blog.save();
      return res.status(200).json({ message: 'Dislike removed', dislikes: blog.dislikes.length });
    }

    // Add the user's dislike
    blog.dislikes.push(userId);
    await blog.save();

    res.status(200).json({ message: 'Blog disliked', dislikes: blog.dislikes.length });
  } catch (error) {
    console.error('Error disliking blog:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// const likeDislikePost = async (req, res) => {
//   const { blogId } = req.params;
//   const { action } = req.body; // Action: "like" or "dislike"

//   if (!['like', 'dislike'].includes(action)) {
//     return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike".' });
//   }

//   try {
//     const blog = await Blog.findById(blogId);
//     if (!blog) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Prevent liking/disliking your own post
//     if (blog.author.toString() === req.user.id) {
//       return res.status(403).json({ message: 'You cannot like or dislike your own post.' });
//     }

//     // Handle like/dislike action
//     if (action === 'like') {
//       blog.dislikes = blog.dislikes.filter(userId => userId.toString() !== req.user.id); // Remove from dislikes
//       if (!blog.likes.includes(req.user.id)) {
//         blog.likes.push(req.user.id);
//       }
//     } else if (action === 'dislike') {
//       blog.likes = blog.likes.filter(userId => userId.toString() !== req.user.id); // Remove from likes
//       if (!blog.dislikes.includes(req.user.id)) {
//         blog.dislikes.push(req.user.id);
//       }
//     }

//     await blog.save();

//     res.status(200).json({ message: `You have successfully ${action}d the post.` });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const likeDislikePost = async (req, res) => {
  const { blogId } = req.params;
  const { action } = req.body; // Action: "like" or "dislike"

  if (!['like', 'dislike'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Use "like" or "dislike".' });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Prevent liking/disliking your own post
    if (blog.author.toString() === req.user.id) {
      return res.status(403).json({ message: 'You cannot like or dislike your own post.' });
    }

    // Handle like/dislike action
    if (action === 'like') {
      blog.dislikes = blog.dislikes.filter((userId) => userId.toString() !== req.user.id); // Remove from dislikes
      if (!blog.likes.includes(req.user.id)) {
        blog.likes.push(req.user.id);
      }
    } else if (action === 'dislike') {
      blog.likes = blog.likes.filter((userId) => userId.toString() !== req.user.id); // Remove from likes
      if (!blog.dislikes.includes(req.user.id)) {
        blog.dislikes.push(req.user.id);
      }
    }

    await blog.save();

    res.status(200).json({
      message: `You have successfully ${action}d the post.`,
      likes: blog.likes.length,
      dislikes: blog.dislikes.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const blogs = await Blog.find({ categories: categoryId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first

    // console.log(blogs)

    const totalBlogs = await Blog.countDocuments({ categories: categoryId });

    // res.status(200).json({
    //   success: true,
    //   data: blogs,
    //   pagination: {
    //     total: totalBlogs,
    //     page: parseInt(page),
    //     limit: parseInt(limit),
    //   },
    // });

    res.status(200).json({
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      blogs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs by category',
      error: error.message,
    });
  }
};

const getBlogsByUser = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const blogs = await Blog.find({ author: userId }).populate('author', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sort by newest first

    const totalBlogs = await Blog.countDocuments({ author: userId });

    res.status(200).json({
      totalBlogs,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blogs by user id' });
  }
}

const getAdminBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch blogs authored by admins with pagination
    const blogs = await Blog.find()
      .populate('author', 'username role') // Populate author details
      .skip((pageNumber - 1) * limitNumber) // Skip blogs for previous pages
      .limit(limitNumber) // Limit the number of blogs per page
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Filter blogs where the author's role is "admin"
    const adminBlogs = blogs.filter((blog) => blog.author && blog.author.role === 'admin');

    // Get the total count of blogs authored by admins
    const totalBlogs = await Blog.countDocuments({
      author: { $exists: true }, // Ensure the author exists
    });

    res.status(200).json({
      totalBlogs: adminBlogs.length,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBlogs / limitNumber),
      blogs: adminBlogs,
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: error.message });
  }
};

const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query; // Get search query, page, and limit from query params

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Search blogs by title or content (case-insensitive)
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: q, $options: 'i' } }, // Case-insensitive search in title
        { content: { $regex: q, $options: 'i' } }, // Case-insensitive search in content
      ],
    })
      .populate('author', 'username') // Populate author details
      .skip((pageNumber - 1) * limitNumber) // Skip blogs for previous pages
      .limit(limitNumber) // Limit the number of blogs per page
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Get the total count of matching blogs
    const totalBlogs = await Blog.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    });

    res.status(200).json({
      totalBlogs,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBlogs / limitNumber),
      blogs,
    });
  } catch (error) {
    console.error('Error searching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { getAdminBlogs, searchBlogs, getBlogsByUser, createNewBlog, getAllBlogs, deleteBlog, likeDislikePost, getBlogsByCategory, getSingleBlog, getBlogComments, getblogLikes, getblogDislikes }