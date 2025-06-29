const Category = require('../models/Category');
const Blog = require('../models/Blog');

const createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
}

// const getAllCategories = async (req, res) => {
//     try {
//         const categories = await Category.find().populate('blogs', '_id'); // Populate blog IDs
//         res.status(200).json(categories);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to retrieve categories' });
//     }
// };

// Using MongoDB Aggregation to get all categories with blog IDs
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'blogs', // The name of the blogs collection
                    localField: '_id', // The _id field in the Category model
                    foreignField: 'categories', // The categories field in the Blog model
                    as: 'blogs', // The name of the array to store the joined data
                },
            },
            {
                $project: {
                    name: 1, // Include the category name
                    description: 1, // Include the category description
                    blogCount: { $size: '$blogs' }, // Add a field for the count of blogs
                },
            },
        ]);

        // console.log(categories)
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
};

const getSingleCategory = async (req, res) => {
    const {categoryId} = req.params

    try {
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        // console.log(blog)
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve category by id' });
    }
}

const deleteCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
  
      // Check if the category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Check if there are any blogs associated with this category
      const blogsInCategory = await Blog.find({ category: categoryId });
      if (blogsInCategory.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete category with associated blogs. Please delete or reassign the blogs first.',
        });
      }
  
      // Delete the category
      await Category.findByIdAndDelete(categoryId);
  
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = { createCategory, getAllCategories, getSingleCategory, deleteCategory }
