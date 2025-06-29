const parseUploadType = (req, res, next) => {
    // console.log(req.body.uploadType)
    // console.log(req.query.uploadType)
    // console.log(req.headers['x-upload-type'])
    const uploadType = req.query.uploadType || req.headers['x-upload-type'] || 'default'; // Extract from query or headers
    req.uploadType = uploadType; // Attach it to the request object
    // console.log(uploadType)
    next();
};

module.exports = parseUploadType;