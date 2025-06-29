const path = require('path');
const fs = require('fs'); // Import the fs module
const multer = require('multer');

// Set up storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../uploads/profile-pictures')); // Directory to store profile pictures
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//     }
// });




// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const userId = req.user?.id || 'default'; // Use user ID or a default folder
//         const userDir = path.join(__dirname, `../uploads/profile-pictures/${userId}`);

//         // Check if the directory exists, if not, create it
//         if (!fs.existsSync(userDir)) {
//             fs.mkdirSync(userDir, { recursive: true });
//         }

//         cb(null, userDir); // Set the user's directory as the destination
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//     }
// });

// File filter to allow only image files
// const fileFilter = (req, file, cb) => {
//     const allowedFileTypes = /jpeg|jpg|png/;
//     const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedFileTypes.test(file.mimetype);

//     if (extname && mimetype) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only image files (jpeg, jpg, png) are allowed!'));
//     }
// };

// Multer configuration
// const upload = multer({
//     storage,
//     limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
//     fileFilter
// });



// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadType = req.uploadType || 'default'; // Use 'default' if no type is provided
        let uploadDir;

        if (uploadType === 'profile') {
            const userId = req.user?.id || 'default'; // Use user ID or a default folder
            uploadDir = path.join(__dirname, `../uploads/profile-pictures/${userId}`);
        } else if (uploadType === 'blog') {
            uploadDir = path.join(__dirname, '../uploads/blog-images'); // Temporary directory for blog images
        } else {
            uploadDir = path.join(__dirname, '../uploads/others');
        }

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir); // Set the determined directory as the destination
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png) are allowed!'));
    }
};

// Multer configuration
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
    fileFilter
});

module.exports = upload;