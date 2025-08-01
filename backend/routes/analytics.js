
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/usage', authMiddleware, analyticsController.getUsage);
router.get('/documents', authMiddleware, analyticsController.getDocuments);

module.exports = router;
