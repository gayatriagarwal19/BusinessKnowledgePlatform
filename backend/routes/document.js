
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.post('/upload', [authMiddleware, uploadMiddleware], documentController.upload);
router.get('/', authMiddleware, documentController.getDocuments);
router.get('/:id', authMiddleware, documentController.getDocument);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;
