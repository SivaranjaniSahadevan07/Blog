const parseUploadType = (req, res, next) => {
    const uploadType = req.query.uploadType || req.headers['x-upload-type'] || 'default'; // Extract from query or headers
    req.uploadType = uploadType; // Attach it to the request object
    next();
};

module.exports = parseUploadType;