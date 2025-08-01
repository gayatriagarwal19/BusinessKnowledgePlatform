
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sessions', authMiddleware, chatController.createSession);
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/history/:sessionId', authMiddleware, chatController.getHistory);

module.exports = router;
