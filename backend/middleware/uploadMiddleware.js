const multer = require('multer');

// Use memoryStorage to handle files as buffers
const storage = multer.memoryStorage();

// Configure multer with a 100MB file size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

module.exports = upload.single('file');
